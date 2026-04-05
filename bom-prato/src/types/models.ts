export interface Preference {
  id: number;
  name: string;
}

export interface Allergy {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  preferences: string;
  allergies: string;
}

export interface Ingredient {
  amount: number;
  unit: string;
  name: string;
}

export interface Instruction {
  text: string;
  timer_seconds: number | null;
}

export interface Recipe {
  id: number;
  title: string;
  category: string;
  time_minutes: number;
  difficulty: string;
  rating: number;
  image_url: string;
  base_portions: number;
  ingredients: string | Ingredient[];
  instructions: string | Instruction[];
  suitable_for_prefs: string; 
  contains_allergies: string; 
}

export interface UserHistory {
  id: number;
  user_id: number;
  recipe_id: number;
  cooked_date: string;
  notes: string | null;
}