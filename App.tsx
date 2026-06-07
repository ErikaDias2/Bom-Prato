import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, Platform } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons'; 
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font'; 
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
import CustomCategoriesScreen from './src/screens/CustomCategoriesScreen';
import FridgeScreen from './src/screens/FridgeScreen';
import { useGlobalTimerManager } from './src/hooks/useGlobalTimerManager';
import TimerManagementScreen from './src/screens/TimerManagementScreen';
import SavedRecipesScreen from './src/screens/SavedRecipesScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, 
    shouldShowList: true,   
  }),
});

export const navigationRef = createNavigationContainerRef<any>();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'Planner') iconName = focused ? 'calendar' : 'calendar-outline';
          if (route.name === 'Início') iconName = focused ? 'home' : 'home-outline';
          if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';
          if (route.name === 'Favoritos') iconName = focused ? 'heart' : 'heart-outline';
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
  useGlobalTimerManager();
  const [dbReady, setDbReady] = useState(false);
  const [pendingRecipe, setPendingRecipe] = useState<any>(null); 
  
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontError) {
      console.error("ERRO NAS FONTES:", fontError);
    }
  }, [fontError]);

  useEffect(() => {
    async function setupApp() {
      try {
        initDatabase();  
        setDbReady(true);  
      } catch (error) {
        console.error("Erro fatal ao carregar o banco de dados:", error);
      }

      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Lembretes de Refeição',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF6A00',
          });
        }
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permissão para notificações não concedida');
        }
      } catch (error) {
        console.error("Erro ao solicitar notificações:", error);
      }
    }

    setupApp();

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      let recipeToOpen = null;

      if (data?.recipeStr) {
        try {
          // @ts-ignore - Ignora o falso positivo do TS sobre rotas estritas
          recipeToOpen = JSON.parse(data.recipeStr);
        } catch (e) {
          console.error("Erro ao ler receita da notificação", e);
        }
      } else if (data?.recipe) {
        recipeToOpen = data.recipe;
      }

      if (recipeToOpen) {
        if (navigationRef.isReady()) {
          (navigationRef as any).navigate('RecipeDetails', { recipe: recipeToOpen });
        } else {
          setPendingRecipe(recipeToOpen);
        }
      }
    });

    return () => subscription.remove();
  }, []);

  if (!dbReady || (!fontsLoaded && !fontError)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#FF6A00" />
        <Text style={{ marginTop: 10 }}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer 
      ref={navigationRef}
      onReady={() => {
        if (pendingRecipe) {
          setTimeout(() => {
            (navigationRef as any).navigate('RecipeDetails', { recipe: pendingRecipe });
            setPendingRecipe(null);
          }, 300); 
        }
      }}
    >
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
        <Stack.Screen name="CustomCategories" component={CustomCategoriesScreen} options={{ title: 'Categorias' }} />
        <Stack.Screen name="Fridge" component={FridgeScreen} options={{ title: 'Geladeira' }} />
        <Stack.Screen name="Timers" component={TimerManagementScreen} options={{ title: 'Timers Ativos', headerTintColor: '#FF6A00' }} />
        <Stack.Screen name="SavedRecipes" component={SavedRecipesScreen} options={{ title: 'Receitas Salvas', headerTintColor: '#FF6A00' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}