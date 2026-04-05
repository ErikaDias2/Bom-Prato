import * as SQLite from 'expo-sqlite';

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

const INITIAL_RECIPES_DATA = [
  {
    title: "Lasanha à Bolonhesa Clássica", category: "Almoço", time_minutes: 60, difficulty: "Média", rating: 4.8, base_portions: 6,
    image_url: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500",
    ingredients: JSON.stringify([{ amount: 500, unit: "g", name: "Massa para lasanha" }, { amount: 500, unit: "g", name: "Carne moída" }, { amount: 2, unit: "xícaras", name: "Molho de tomate" }, { amount: 300, unit: "g", name: "Queijo mussarela" }]),
    instructions: JSON.stringify([{ text: "Refogue a carne moída, adicione o molho de tomate e cozinhe por 10 minutos.", timer_seconds: 600 }, { text: "Intercale camadas de molho, massa e queijo em um refratário.", timer_seconds: null }, { text: "Asse em forno a 180ºC por 40 minutos.", timer_seconds: 2400 }]),
    suitable_for_prefs: "[]", contains_allergies: "[1, 2]"
  },
  {
    title: "Estrogonofe de Frango", category: "Almoço", time_minutes: 30, difficulty: "Fácil", rating: 4.9, base_portions: 4,
    image_url: "https://media.istockphoto.com/id/1313903217/pt/foto/delicious-chicken-strogonoff-with-mushrooms.webp?a=1&b=1&s=612x612&w=0&k=20&c=gft-a0OTc_0meTlZW1DTrPszqYWqQf-pMGV-cRe6IJw=",
    ingredients: JSON.stringify([{ amount: 500, unit: "g", name: "Peito de frango" }, { amount: 1, unit: "caixa", name: "Creme de leite" }, { amount: 3, unit: "colheres", name: "Ketchup" }]),
    instructions: JSON.stringify([{ text: "Doure o frango em cubos com cebola.", timer_seconds: 300 }, { text: "Adicione o ketchup, mostarda e champignon. Cozinhe por 5 minutos.", timer_seconds: 300 }, { text: "Desligue o fogo, misture o creme de leite e sirva.", timer_seconds: null }]),
    suitable_for_prefs: "[]", contains_allergies: "[2]"
  },
  {
    title: "Macarrão à Carbonara", category: "Almoço", time_minutes: 25, difficulty: "Média", rating: 4.7, base_portions: 2,
    image_url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500",
    ingredients: JSON.stringify([{ amount: 200, unit: "g", name: "Espaguete" }, { amount: 100, unit: "g", name: "Bacon" }, { amount: 3, unit: "unidades", name: "Ovos" }, { amount: 50, unit: "g", name: "Queijo Parmesão" }]),
    instructions: JSON.stringify([{ text: "Cozinhe o macarrão até ficar al dente.", timer_seconds: 480 }, { text: "Frite o bacon até ficar crocante.", timer_seconds: 300 }, { text: "Misture os ovos com o queijo. Incorpore tudo no macarrão quente fora do fogo.", timer_seconds: null }]),
    suitable_for_prefs: "[]", contains_allergies: "[1, 2]"
  },
  {
    title: "Feijoada Rápida", category: "Almoço", time_minutes: 60, difficulty: "Média", rating: 4.9, base_portions: 6,
    image_url: "https://plus.unsplash.com/premium_photo-1667844706940-8155d4efd498?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmVpam9hZGF8ZW58MHx8MHx8fDA%3D",
    ingredients: JSON.stringify([{ amount: 500, unit: "g", name: "Feijão preto" }, { amount: 300, unit: "g", name: "Linguiça calabresa" }, { amount: 200, unit: "g", name: "Carne seca" }]),
    instructions: JSON.stringify([{ text: "Cozinhe o feijão com as carnes na panela de pressão por 40 minutos.", timer_seconds: 2400 }, { text: "Abra a panela, tempere com alho refogado e deixe o caldo engrossar por 15 minutos.", timer_seconds: 900 }]),
    suitable_for_prefs: "[]", contains_allergies: "[]"
  },
  {
    title: "Bife a Cavalo", category: "Almoço", time_minutes: 20, difficulty: "Fácil", rating: 4.6, base_portions: 2,
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500",
    ingredients: JSON.stringify([{ amount: 2, unit: "unidades", name: "Bifes de alcatra" }, { amount: 2, unit: "unidades", name: "Ovos" }, { amount: 2, unit: "dentes", name: "Alho" }]),
    instructions: JSON.stringify([{ text: "Grelhe os bifes temperados no ponto desejado.", timer_seconds: 240 }, { text: "Frite os ovos deixando a gema mole e coloque sobre os bifes.", timer_seconds: 120 }]),
    suitable_for_prefs: "[3]", contains_allergies: "[]"
  },
  {
    title: "Bolo de Cenoura Fofinho", category: "Sobremesa", time_minutes: 50, difficulty: "Fácil", rating: 5.0, base_portions: 8,
    image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500",
    ingredients: JSON.stringify([{ amount: 3, unit: "unidades", name: "Cenouras" }, { amount: 2, unit: "xícaras", name: "Farinha de trigo" }, { amount: 1, unit: "xícara", name: "Óleo" }]),
    instructions: JSON.stringify([{ text: "Bata as cenouras, o óleo e os ovos no liquidificador.", timer_seconds: 180 }, { text: "Misture a farinha e asse em forno a 180ºC por 40 minutos.", timer_seconds: 2400 }]),
    suitable_for_prefs: "[1]", contains_allergies: "[1]"
  },
  {
    title: "Pudim de Leite Condensado", category: "Sobremesa", time_minutes: 90, difficulty: "Média", rating: 4.9, base_portions: 8,
    image_url: "https://images.unsplash.com/photo-1702728109878-c61a98d80491?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cHVkaW18ZW58MHx8MHx8fDA%3D",
    ingredients: JSON.stringify([{ amount: 1, unit: "lata", name: "Leite condensado" }, { amount: 1, unit: "medida", name: "Leite" }, { amount: 3, unit: "unidades", name: "Ovos" }]),
    instructions: JSON.stringify([{ text: "Faça uma calda de caramelo na forma.", timer_seconds: 300 }, { text: "Bata os ingredientes no liquidificador, despeje na forma e asse em banho-maria por 60 minutos.", timer_seconds: 3600 }, { text: "Gele por 4 horas antes de desenformar.", timer_seconds: null }]),
    suitable_for_prefs: "[1]", contains_allergies: "[2]"
  },
  {
    title: "Brigadeiro Tradicional", category: "Sobremesa", time_minutes: 15, difficulty: "Fácil", rating: 5.0, base_portions: 20,
    image_url: "https://images.unsplash.com/photo-1702982852429-e0d0b27eb990?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YnJpZ2FkZWlyb3xlbnwwfHwwfHx8MA%3D%3D",
    ingredients: JSON.stringify([{ amount: 1, unit: "lata", name: "Leite condensado" }, { amount: 3, unit: "colheres", name: "Cacau em pó" }, { amount: 1, unit: "colher", name: "Manteiga" }]),
    instructions: JSON.stringify([{ text: "Misture tudo na panela em fogo baixo até desgrudar do fundo.", timer_seconds: 600 }, { text: "Deixe esfriar, enrole e passe no granulado.", timer_seconds: null }]),
    suitable_for_prefs: "[1]", contains_allergies: "[2]"
  },
  {
    title: "Mousse de Maracujá", category: "Sobremesa", time_minutes: 15, difficulty: "Fácil", rating: 4.8, base_portions: 6,
    image_url: "https://media.istockphoto.com/id/1299828061/pt/foto/passion-fruit-mousse-refreshing-dessert-with-fresh-passion-fruit-topping.webp?a=1&b=1&s=612x612&w=0&k=20&c=OhdXpEqFR3sOczeFaN13RlWIrbbEWecx70UG1gGbaik=",
    ingredients: JSON.stringify([{ amount: 1, unit: "lata", name: "Leite condensado" }, { amount: 1, unit: "caixa", name: "Creme de leite" }, { amount: 1, unit: "xícara", name: "Suco de maracujá" }]),
    instructions: JSON.stringify([{ text: "Bata todos os ingredientes no liquidificador por 5 minutos.", timer_seconds: 300 }, { text: "Leve à geladeira por 3 horas antes de servir.", timer_seconds: null }]),
    suitable_for_prefs: "[1]", contains_allergies: "[2]"
  },
  {
    title: "Torta de Limão", category: "Sobremesa", time_minutes: 40, difficulty: "Média", rating: 4.9, base_portions: 8,
    image_url: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=500",
    ingredients: JSON.stringify([{ amount: 200, unit: "g", name: "Biscoito maisena" }, { amount: 100, unit: "g", name: "Manteiga derretida" }, { amount: 1, unit: "lata", name: "Leite condensado" }, { amount: 3, unit: "unidades", name: "Limões" }]),
    instructions: JSON.stringify([{ text: "Triture o biscoito, misture com a manteiga e asse a base por 10 minutos.", timer_seconds: 600 }, { text: "Misture o leite condensado com o suco de limão e recheie a torta.", timer_seconds: null }]),
    suitable_for_prefs: "[1]", contains_allergies: "[1, 2]"
  },
  {
    title: "Salada de Quinoa Tropical", category: "Fitness", time_minutes: 20, difficulty: "Fácil", rating: 4.9, base_portions: 2,
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
    ingredients: JSON.stringify([{ amount: 1, unit: "xícara", name: "Quinoa" }, { amount: 1, unit: "unidade", name: "Manga picada" }, { amount: 100, unit: "g", name: "Tomate cereja" }]),
    instructions: JSON.stringify([{ text: "Cozinhe a quinoa em água fervente por 15 minutos.", timer_seconds: 900 }, { text: "Escorra, espere esfriar, junte a manga e tomates e tempere.", timer_seconds: null }]),
    suitable_for_prefs: "[1, 2]", contains_allergies: "[]"
  },
  {
    title: "Frango Grelhado com Batata Doce", category: "Fitness", time_minutes: 35, difficulty: "Fácil", rating: 4.8, base_portions: 2,
    image_url: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=500",
    ingredients: JSON.stringify([{ amount: 300, unit: "g", name: "Peito de frango" }, { amount: 200, unit: "g", name: "Batata doce" }, { amount: 1, unit: "fio", name: "Azeite" }]),
    instructions: JSON.stringify([{ text: "Cozinhe a batata doce até amolecer e leve ao forno para dourar.", timer_seconds: 1200 }, { text: "Grelhe os filés de frango na frigideira com azeite de cada lado.", timer_seconds: 480 }]),
    suitable_for_prefs: "[3]", contains_allergies: "[]"
  },
  {
    title: "Omelete de Espinafre", category: "Fitness", time_minutes: 10, difficulty: "Fácil", rating: 4.7, base_portions: 1,
    image_url: "https://images.unsplash.com/photo-1607877200978-3cab430e00cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b21lbGV0ZSUyMGRlJTIwZXNwaW5hZnJlfGVufDB8fDB8fHww",
    ingredients: JSON.stringify([{ amount: 3, unit: "unidades", name: "Ovos" }, { amount: 1, unit: "xícara", name: "Folhas de espinafre" }, { amount: 1, unit: "pitada", name: "Sal" }]),
    instructions: JSON.stringify([{ text: "Bata os ovos e misture o espinafre picado.", timer_seconds: null }, { text: "Despeje em frigideira quente e cozinhe por 3 minutos de cada lado.", timer_seconds: 360 }]),
    suitable_for_prefs: "[1, 3]", contains_allergies: "[]"
  },
  {
    title: "Crepioca de Queijo Branco", category: "Fitness", time_minutes: 10, difficulty: "Fácil", rating: 4.9, base_portions: 1,
    image_url: "https://media.istockphoto.com/id/964362908/pt/foto/crepioca-pancake-of-cassava-with-cheese-on-plate-on-wooden-background-selective-focus.webp?a=1&b=1&s=612x612&w=0&k=20&c=fI2BIgMKI84s6Ing5z_eV_Y9MUZYaA9VSUNhtysSK_s=",
    ingredients: JSON.stringify([{ amount: 1, unit: "unidade", name: "Ovo" }, { amount: 2, unit: "colheres", name: "Goma de tapioca" }, { amount: 50, unit: "g", name: "Queijo branco" }]),
    instructions: JSON.stringify([{ text: "Bata o ovo e a tapioca com um garfo.", timer_seconds: null }, { text: "Despeje na frigideira, adicione o queijo e dobre ao meio até dourar.", timer_seconds: 180 }]),
    suitable_for_prefs: "[1]", contains_allergies: "[2]"
  },
  {
    title: "Panqueca de Aveia e Banana", category: "Fitness", time_minutes: 15, difficulty: "Fácil", rating: 4.8, base_portions: 1,
    image_url: "https://images.unsplash.com/photo-1494597564530-871f2b93ac55?w=500",
    ingredients: JSON.stringify([{ amount: 1, unit: "unidade", name: "Banana amassada" }, { amount: 2, unit: "unidades", name: "Ovos" }, { amount: 3, unit: "colheres", name: "Aveia em flocos" }]),
    instructions: JSON.stringify([{ text: "Misture todos os ingredientes até obter uma massa uniforme.", timer_seconds: null }, { text: "Cozinhe porções da massa em frigideira antiaderente até dourar os lados.", timer_seconds: 300 }]),
    suitable_for_prefs: "[1]", contains_allergies: "[1]"
  },
  {
    title: "Sopa de Legumes Nutritiva", category: "Jantar", time_minutes: 40, difficulty: "Fácil", rating: 4.8, base_portions: 4,
    image_url: "https://images.unsplash.com/photo-1665594051407-7385d281ad76?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c29wYSUyMGRlJTIwbGVndW1lc3xlbnwwfHwwfHx8MA%3D%3D",
    ingredients: JSON.stringify([{ amount: 2, unit: "unidades", name: "Cenouras" }, { amount: 2, unit: "unidades", name: "Batatas" }, { amount: 1, unit: "unidade", name: "Abobrinha" }, { amount: 1, unit: "litro", name: "Caldo de carne ou legumes" }]),
    instructions: JSON.stringify([{ text: "Refogue os legumes picados em um pouco de azeite.", timer_seconds: 300 }, { text: "Cubra com o caldo e deixe cozinhar em fogo médio até os legumes amolecerem.", timer_seconds: 1500 }]),
    suitable_for_prefs: "[1, 2, 3]", contains_allergies: "[]"
  },
  {
    title: "Pizza Margherita Caseira", category: "Jantar", time_minutes: 45, difficulty: "Média", rating: 5.0, base_portions: 4,
    image_url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500",
    ingredients: JSON.stringify([{ amount: 1, unit: "unidade", name: "Massa pronta de pizza" }, { amount: 1, unit: "xícara", name: "Molho de tomate" }, { amount: 200, unit: "g", name: "Mussarela" }, { amount: 1, unit: "punhado", name: "Manjericão" }]),
    instructions: JSON.stringify([{ text: "Espalhe o molho sobre a massa e distribua o queijo.", timer_seconds: null }, { text: "Asse em forno pré-aquecido a 220ºC até o queijo borbulhar.", timer_seconds: 900 }, { text: "Adicione as folhas de manjericão fresco ao retirar do forno.", timer_seconds: null }]),
    suitable_for_prefs: "[1]", contains_allergies: "[1, 2]"
  },
  {
    title: "Salmão Grelhado ao Limão", category: "Jantar", time_minutes: 20, difficulty: "Fácil", rating: 4.9, base_portions: 2,
    image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500",
    ingredients: JSON.stringify([{ amount: 2, unit: "filés", name: "Salmão" }, { amount: 1, unit: "unidade", name: "Limão" }, { amount: 1, unit: "colher", name: "Azeite" }]),
    instructions: JSON.stringify([{ text: "Tempere o salmão com sal, pimenta e suco de limão.", timer_seconds: null }, { text: "Grelhe na frigideira quente com azeite por 4 minutos de cada lado.", timer_seconds: 480 }]),
    suitable_for_prefs: "[3]", contains_allergies: "[4]"
  },
  {
    title: "Risoto de Cogumelos", category: "Jantar", time_minutes: 45, difficulty: "Difícil", rating: 4.7, base_portions: 2,
    image_url: "https://images.unsplash.com/photo-1609770424775-39ec362f2d94?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmlzb3RvJTIwZGUlMjBjb2d1bWVsb3N8ZW58MHx8MHx8fDA%3D",
    ingredients: JSON.stringify([{ amount: 1, unit: "xícara", name: "Arroz arbório" }, { amount: 200, unit: "g", name: "Cogumelos fatiados" }, { amount: 1, unit: "litro", name: "Caldo de legumes" }]),
    instructions: JSON.stringify([{ text: "Refogue os cogumelos e reserve. Na mesma panela, refogue o arroz.", timer_seconds: 300 }, { text: "Adicione o caldo aos poucos, mexendo sempre, até o arroz cozinhar.", timer_seconds: 1200 }, { text: "Misture os cogumelos e finalize com queijo parmesão.", timer_seconds: null }]),
    suitable_for_prefs: "[1]", contains_allergies: "[2]"
  },
  {
    title: "Tacos Mexicanos de Carne", category: "Jantar", time_minutes: 30, difficulty: "Média", rating: 4.8, base_portions: 4,
    image_url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500",
    ingredients: JSON.stringify([{ amount: 8, unit: "unidades", name: "Tortilhas de milho" }, { amount: 400, unit: "g", name: "Carne moída" }, { amount: 1, unit: "xícara", name: "Alface picada" }]),
    instructions: JSON.stringify([{ text: "Refogue a carne com temperos mexicanos até dourar bem.", timer_seconds: 600 }, { text: "Aqueça as tortilhas rapidamente na frigideira.", timer_seconds: 120 }, { text: "Monte os tacos com carne, alface, tomate e queijo.", timer_seconds: null }]),
    suitable_for_prefs: "[]", contains_allergies: "[1, 2]"
  }
];

export const initDatabase = () => {
  db.execSync(CREATE_TABLES_QUERY);

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