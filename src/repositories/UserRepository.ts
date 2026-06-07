import { getDb } from '../services/database';

export const UserRepository = {
  authenticate: (email: string, password: string): number | null => {
    const user = getDb().getFirstSync<{ id: number }>(
      'SELECT id FROM users WHERE email = ? AND password = ?',
      [email.toLowerCase(), password]
    );
    return user ? user.id : null;
  },

   
  getUserById: (id: number) => {
    return getDb().getFirstSync<any>('SELECT * FROM users WHERE id = ?', [id]);
  },

   
  updateProfile: (id: number, prefs: number[], allergies: number[]) => {
    getDb().runSync(
      'UPDATE users SET preferences = ?, allergies = ? WHERE id = ?',
      [JSON.stringify(prefs), JSON.stringify(allergies), id]
    );
  },

   
  registerUser: (name: string, email: string, password: string, prefs: number[], allergies: number[]) => {
    getDb().runSync(
      'INSERT INTO users (name, email, password, preferences, allergies) VALUES (?, ?, ?, ?, ?)',
      [name, email.toLowerCase(), password, JSON.stringify(prefs), JSON.stringify(allergies)]
    );
  },

  addRecipeToCategory: (categoryId: number, recipeId: number) => {
    try {
      getDb().runSync('INSERT INTO category_recipes (category_id, recipe_id) VALUES (?, ?)', [categoryId, recipeId]);
    } catch (e) {
    }
  },

  getRecipesByCategory: (categoryId: number) => {
    return getDb().getAllSync<any>(`
      SELECT r.* FROM recipes r
      INNER JOIN category_recipes cr ON r.id = cr.recipe_id
      WHERE cr.category_id = ?
    `, [categoryId]);
  },

  getCustomCategories: (userId: number) => {
    return getDb().getAllSync<any>('SELECT * FROM user_custom_categories WHERE user_id = ? ORDER BY name ASC', [userId]);
  },

  addCustomCategory: (userId: number, name: string) => {
    return getDb().runSync('INSERT INTO user_custom_categories (user_id, name) VALUES (?, ?)', [userId, name]);
  },

  removeCustomCategory: (categoryId: number) => {
    return getDb().runSync('DELETE FROM user_custom_categories WHERE id = ?', [categoryId]);
  },

   
  getPreferences: () => getDb().getAllSync('SELECT * FROM preferences'),
  getAllergies: () => getDb().getAllSync('SELECT * FROM allergies'),
};