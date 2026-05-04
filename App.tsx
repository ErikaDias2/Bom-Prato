import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons'; 
import GuidedPrepScreen from './src/screens/GuidedPrepScreen/index';
import FavoritesScreen from './src/screens/FavoritesScreen/index';
import HistoryScreen from './src/screens/HistoryScreen/index';
import GlossaryScreen from './src/screens/GlossaryScreen';
import { initDatabase } from './src/services/database';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen/index';
import CategoryScreen from './src/screens/CategoryScreen/index'; 
import ProfileScreen from './src/screens/ProfileScreen';
import RecipeDetailsScreen from './src/screens/RecipeDetailsScreen/index';
import CategoryRecipesScreen from './src/screens/CategoryRecipesScreen/index';
import PlannerScreen from './src/screens/PlannerScreen/index'; 
import ShoppingListScreen from './src/screens/ShoppingListScreen/index';
import MyRecipesScreen from './src/screens/MyRecipesScreen/index';
import CreateRecipeScreen from './src/screens/CreateRecipeScreen/index';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'Planner') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }
          if (route.name === 'Início') {
            iconName = focused ? 'home' : 'home-outline';
          }
          if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          if (route.name === 'Favoritos') {
            iconName = focused ? 'heart' : 'heart-outline';
          }
          if (route.name === 'Minhas') iconName = focused ? 'book' : 'book-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6A00',
        tabBarInactiveTintColor: 'gray',
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Minhas" component={MyRecipesScreen} />
      <Tab.Screen name="Planner" component={PlannerScreen} />
      <Tab.Screen name="Favoritos" component={FavoritesScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    try {
      initDatabase();  
      setDbReady(true);  
    } catch (error) {
      console.error("Erro fatal ao carregar o banco de dados:", error);
    }
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#FF6A00" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login', headerTintColor: '#FF6A00' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Criar Conta', headerTintColor: '#FF6A00' }} />
        <Stack.Screen name="RecipeDetails" component={RecipeDetailsScreen} options={{ title: 'Detalhes da Receita', headerTintColor: '#FF6A00' }} />
        <Stack.Screen name="CategoryRecipes" component={CategoryRecipesScreen} options={{ title: 'Receitas', headerTintColor: '#FF6A00' }} />
        <Stack.Screen name="GuidedPrep" component={GuidedPrepScreen} options={{ title: 'Modo de Preparo', headerTintColor: '#FF6A00' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Meu Diário', headerTintColor: '#FF6A00' }} />
        <Stack.Screen name="CategoryScreen" component={CategoryScreen} options={{ title: 'Categorias', headerTintColor: '#FF6A00' }} />
        <Stack.Screen name="ShoppingList" component={ShoppingListScreen} options={{ title: 'Lista de Compras', headerTintColor: '#FF6A00' }} />
        <Stack.Screen name="CreateRecipe" component={CreateRecipeScreen} options={{ title: 'Criar Receita', headerTintColor: '#FF6A00' }} />
        <Stack.Screen name="Glossary" component={GlossaryScreen} options={{ title: 'Glossário', headerTintColor: '#FF6A00' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}