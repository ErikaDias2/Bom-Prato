import { db } from '../services/database';

export const UserRepository = {
  authenticate: (email: string, password: string): number | null => {
    const user = db.getFirstSync<{ id: number }>(
      'SELECT id FROM users WHERE email = ? AND password = ?',
      [email.toLowerCase(), password]
    );
    return user ? user.id : null;
  },

   
  getUserById: (id: number) => {
    return db.getFirstSync<any>('SELECT * FROM users WHERE id = ?', [id]);
  },

   
  updateProfile: (id: number, prefs: number[], allergies: number[]) => {
    db.runSync(
      'UPDATE users SET preferences = ?, allergies = ? WHERE id = ?',
      [JSON.stringify(prefs), JSON.stringify(allergies), id]
    );
  },

   
  registerUser: (name: string, email: string, password: string, prefs: number[], allergies: number[]) => {
    db.runSync(
      'INSERT INTO users (name, email, password, preferences, allergies) VALUES (?, ?, ?, ?, ?)',
      [name, email.toLowerCase(), password, JSON.stringify(prefs), JSON.stringify(allergies)]
    );
  },

   
  getPreferences: () => db.getAllSync('SELECT * FROM preferences'),
  getAllergies: () => db.getAllSync('SELECT * FROM allergies'),
};