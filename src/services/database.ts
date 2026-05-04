import * as SQLite from 'expo-sqlite';
import { INITIAL_RECIPES_DATA } from '../data/initialRecipes';

export const db = SQLite.openDatabaseSync('bomprato_v6.db');

const CREATE_TABLES_QUERY = `
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS preferences (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS allergies (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);
  
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
    preferences TEXT, allergies TEXT    
  );
  
  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, category TEXT NOT NULL, time_minutes INTEGER NOT NULL,
    difficulty TEXT NOT NULL, rating REAL NOT NULL, image_url TEXT NOT NULL, base_portions INTEGER NOT NULL, 
    ingredients TEXT NOT NULL, instructions TEXT NOT NULL, suitable_for_prefs TEXT, contains_allergies TEXT 
  );
  
  CREATE TABLE IF NOT EXISTS user_favorites (
    user_id INTEGER, recipe_id INTEGER, PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(recipe_id) REFERENCES recipes(id)
  );
  
  CREATE TABLE IF NOT EXISTS user_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    recipe_id INTEGER NOT NULL,
    cooked_date TEXT NOT NULL,
    notes TEXT,
    image_url TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(recipe_id) REFERENCES recipes(id)
  );

  CREATE TABLE IF NOT EXISTS meal_plan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    recipe_id INTEGER NOT NULL,
    date TEXT NOT NULL, 
    meal_type TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(recipe_id) REFERENCES recipes(id)
  );

  CREATE TABLE IF NOT EXISTS recipe_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(recipe_id) REFERENCES recipes(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_created_recipes (
    user_id INTEGER, 
    recipe_id INTEGER, 
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY(user_id) REFERENCES users(id), 
    FOREIGN KEY(recipe_id) REFERENCES recipes(id)
  );
`;

const INSERT_PREFS_QUERY = `
  INSERT INTO preferences (name) VALUES ('Vegetariano'), ('Vegano'), ('Low Carb');
  INSERT INTO allergies (name) VALUES ('Glúten'), ('Lactose'), ('Amendoim'), ('Frutos do Mar');
`;

const INSERT_RECIPE_QUERY = `
  INSERT INTO recipes (title, category, time_minutes, difficulty, rating, image_url, base_portions, ingredients, instructions, suitable_for_prefs, contains_allergies) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

export const initDatabase = () => {
  db.execSync(CREATE_TABLES_QUERY);

  try { db.execSync('ALTER TABLE user_history ADD COLUMN image_url TEXT;'); } catch (e) {}

  const prefsCount = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM preferences');
  if (prefsCount && prefsCount.count === 0) {
    db.execSync(INSERT_PREFS_QUERY);
  }
  
  const recipesCount = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM recipes');
  if (recipesCount && recipesCount.count === 0) {
    INITIAL_RECIPES_DATA.forEach(r => {
      db.runSync(
        INSERT_RECIPE_QUERY,
        [r.title, r.category, r.time_minutes, r.difficulty, r.rating, r.image_url, r.base_portions, r.ingredients, r.instructions, r.suitable_for_prefs, r.contains_allergies]
      );
    });
  }
};