import { db } from '../services/database';

export const HistoryRepository = {
   
  saveHistory: (userId: number, recipeId: number, note: string) => {
    const today = new Date().toLocaleDateString('pt-BR');
    db.runSync(
      'INSERT INTO user_history (user_id, recipe_id, cooked_date, notes) VALUES (?, ?, ?, ?)',
      [userId, recipeId, today, note]
    );
  },

   
  getUserHistory: (userId: number) => {
    const query = `
      SELECT h.id as history_id, h.cooked_date, h.notes, r.title, r.image_url, r.id as recipe_id 
      FROM user_history h 
      INNER JOIN recipes r ON h.recipe_id = r.id 
      WHERE h.user_id = ? 
      ORDER BY h.id DESC
    `;
    return db.getAllSync(query, [userId]);
  }
};