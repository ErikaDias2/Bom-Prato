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
    let query = 'SELECT * FROM recipes';
    let params: any[] = [];
    
    if (searchQuery.trim() !== '') {
      query += ' WHERE title LIKE ? OR ingredients LIKE ?';
      params.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    const rawRecipes = db.getAllSync(query, params);

    return rawRecipes.filter((recipe: any) => {
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
    const result = db.getFirstSync<any>('SELECT * FROM recipes WHERE id = ?', [id]);
    if (result) {
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

    const rawRecipes = db.getAllSync('SELECT * FROM recipes WHERE category = ?', [categoryName]);
    
    return rawRecipes.filter((recipe: any) => {
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
      SELECT r.* FROM recipes r 
      INNER JOIN user_favorites uf ON r.id = uf.recipe_id 
      WHERE uf.user_id = ?
    `;
    return db.getAllSync(query, [userId]);
  },
};