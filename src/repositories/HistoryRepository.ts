import { getDb } from '../services/database';

export const HistoryRepository = {
   
  saveHistory: (userId: number, recipeId: number, notes: string, imageUrl: string | null = null) => {
    const dateStr = new Date().toISOString();
    return getDb().runSync(
      'INSERT INTO user_history (user_id, recipe_id, cooked_date, notes, image_url) VALUES (?, ?, ?, ?, ?)',
      [userId, recipeId, dateStr, notes, imageUrl]
    );
  },

   
  getUserHistory: (userId: number) => {
    return getDb().getAllSync<any>(
      `SELECT 
         uh.id as history_id, 
         uh.recipe_id, 
         uh.cooked_date, 
         uh.notes, 
         uh.image_url as user_photo_url, 
         r.title, 
         r.time_minutes, 
         r.category,
         r.image_url as original_recipe_image
       FROM user_history uh
       JOIN recipes r ON uh.recipe_id = r.id
       WHERE uh.user_id = ?
       ORDER BY uh.cooked_date DESC`,
      [userId]
    );
  },
};