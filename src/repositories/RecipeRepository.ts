import { db } from '../services/database';

export const RecipeRepository = {
  getUserFilters: (userId: number | null) => {
    if (!userId) return { allergies: [], prefs: [] };
    
    const user = db.getFirstSync<any>('SELECT allergies, preferences FROM users WHERE id = ?', [userId]);
    if (!user) return { allergies: [], prefs: [] };

    return {
      allergies: JSON.parse(user.allergies || '[]'),
      prefs: JSON.parse(user.preferences || '[]')
    };
  },

  getFilteredRecipes: (searchQuery: string, filterCategory: string, filterDifficulty: string, filterTime: number, userAllergies: number[], userPrefs: number[]) => {
    let query = `
      SELECT r.*, 
             COALESCE((SELECT AVG(rating) FROM recipe_reviews WHERE recipe_id = r.id), 0) as real_rating
      FROM recipes r
    `;
    let params: any[] = [];
    
    if (searchQuery.trim() !== '') {
      query += ' WHERE r.title LIKE ? OR r.ingredients LIKE ?';
      params.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    const rawRecipes = db.getAllSync(query, params);

    return rawRecipes.filter((recipe: any) => {
      recipe.rating = recipe.real_rating;

      if (userAllergies.length > 0) {
        const recipeAllergies = JSON.parse(recipe.contains_allergies || '[]');
        if (recipeAllergies.some((a: number) => userAllergies.includes(a))) return false;
      }
      
      if (userPrefs.length > 0) {
        const recipePrefs = JSON.parse(recipe.suitable_for_prefs || '[]');
        const meetsAllPrefs = userPrefs.every((p: number) => recipePrefs.includes(p));
        if (!meetsAllPrefs) return false;
      }
      
      if (filterCategory !== 'Todas' && recipe.category !== filterCategory) return false;
      if (filterDifficulty !== 'Todas' && recipe.difficulty !== filterDifficulty) return false;
      if (filterTime > 0 && recipe.time_minutes > filterTime) return false;

      return true;
    });
  },

  getRecipeById: (id: number) => {
    const result = db.getFirstSync<any>(`
      SELECT r.*, 
             COALESCE((SELECT AVG(rating) FROM recipe_reviews WHERE recipe_id = r.id), 0) as real_rating
      FROM recipes r WHERE r.id = ?
    `, [id]);

    if (result) {
      result.rating = result.real_rating;
      result.ingredients = JSON.parse(result.ingredients);
      result.instructions = JSON.parse(result.instructions);
    }
    return result;
  },

  isFavorite: (userId: number, recipeId: number) => {
    const result = db.getFirstSync('SELECT * FROM user_favorites WHERE user_id = ? AND recipe_id = ?', [userId, recipeId]);
    return !!result;  
  },

  toggleFavorite: (userId: number, recipeId: number, isCurrentlyFavorite: boolean) => {
    if (isCurrentlyFavorite) {
      db.runSync('DELETE FROM user_favorites WHERE user_id = ? AND recipe_id = ?', [userId, recipeId]);
      return false;
    } else {
      db.runSync('INSERT INTO user_favorites (user_id, recipe_id) VALUES (?, ?)', [userId, recipeId]);
      return true;
    }
  },

  getRecipesByCategory: (categoryName: string, userId: number | null) => {
    let allergies: number[] = [];
    let prefs: number[] = [];

    if (userId) {
      const user = db.getFirstSync<any>('SELECT allergies, preferences FROM users WHERE id = ?', [userId]);
      if (user) {
        allergies = JSON.parse(user.allergies || '[]');
        prefs = JSON.parse(user.preferences || '[]');
      }
    }

    const rawRecipes = db.getAllSync(`
      SELECT r.*, 
             COALESCE((SELECT AVG(rating) FROM recipe_reviews WHERE recipe_id = r.id), 0) as real_rating
      FROM recipes r WHERE r.category = ?
    `, [categoryName]);
    
    return rawRecipes.filter((recipe: any) => {
      recipe.rating = recipe.real_rating;

      if (allergies.length > 0) {
        const recipeAllergies = JSON.parse(recipe.contains_allergies || '[]');
        if (recipeAllergies.some((a: number) => allergies.includes(a))) return false;
      }
      if (prefs.length > 0) {
        const recipePrefs = JSON.parse(recipe.suitable_for_prefs || '[]');
        const meetsAllPrefs = prefs.every((p: number) => recipePrefs.includes(p));
        if (!meetsAllPrefs) return false;
      }
      return true;
    });
  },

  getCategories: () => {
    return db.getAllSync(`
      SELECT category, MIN(image_url) as image_url 
      FROM recipes 
      GROUP BY category
    `);
  },

  getFavoriteRecipes: (userId: number) => {
    const query = `
      SELECT r.*, 
             COALESCE((SELECT AVG(rating) FROM recipe_reviews WHERE recipe_id = r.id), 0) as real_rating
      FROM recipes r 
      INNER JOIN user_favorites uf ON r.id = uf.recipe_id 
      WHERE uf.user_id = ?
    `;
    const raw = db.getAllSync(query, [userId]);
    return raw.map((r: any) => {
      r.rating = r.real_rating;
      return r;
    });
  },

  getWeeklyPlan: (userId: number, startDate: string, endDate: string) => {
    return db.getAllSync<any>(
      `SELECT mp.id as plan_id, mp.user_id, mp.recipe_id, mp.date, mp.meal_type, r.title, r.image_url, r.time_minutes, r.category, r.ingredients 
       FROM meal_plan mp
       JOIN recipes r ON mp.recipe_id = r.id
       WHERE mp.user_id = ? AND mp.date BETWEEN ? AND ?`,
      [userId, startDate, endDate]
    );
  },

  addToPlan: (userId: number, recipeId: number, date: string, mealType: string) => {
    return db.runSync(
      'INSERT INTO meal_plan (user_id, recipe_id, date, meal_type) VALUES (?, ?, ?, ?)',
      [userId, recipeId, date, mealType]
    );
  },

  removeFromPlan: (planId: number) => {
    return db.runSync('DELETE FROM meal_plan WHERE id = ?', [planId]);
  },

  getReviews: (recipeId: number) => {
    return db.getAllSync<any>(
      `SELECT rr.*, u.name as user_name 
       FROM recipe_reviews rr 
       JOIN users u ON rr.user_id = u.id 
       WHERE rr.recipe_id = ? 
       ORDER BY rr.created_at DESC`, 
      [recipeId]
    );
  },

  addReview: (recipeId: number, userId: number, rating: number, comment: string) => {
    const date = new Date().toISOString(); 
    return db.runSync(
      'INSERT INTO recipe_reviews (recipe_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)',
      [recipeId, userId, rating, comment, date]
    );
  },

  createRecipe: (userId: number, data: any) => {
    const result = db.runSync(
      `INSERT INTO recipes (title, category, time_minutes, difficulty, rating, image_url, base_portions, ingredients, instructions, suitable_for_prefs, contains_allergies) 
       VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, '[]', '[]')`,
      [data.title, data.category, data.time_minutes, data.difficulty, data.image_url, data.base_portions, JSON.stringify(data.ingredients), JSON.stringify(data.instructions)]
    );
    db.runSync(
      'INSERT INTO user_created_recipes (user_id, recipe_id) VALUES (?, ?)',
      [userId, result.lastInsertRowId]
    );
  },

  getUserCreatedRecipes: (userId: number) => {
    const raw = db.getAllSync<any>(`
      SELECT r.*, 
             COALESCE((SELECT AVG(rating) FROM recipe_reviews WHERE recipe_id = r.id), 0) as real_rating
      FROM recipes r
      INNER JOIN user_created_recipes ucr ON r.id = ucr.recipe_id
      WHERE ucr.user_id = ?
    `, [userId]);

    return raw.map((r: any) => {
      r.rating = r.real_rating;
      return r;
    });
  }
};