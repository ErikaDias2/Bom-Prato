import { useState, useCallback } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import RecipeCard from '../../components/RecipeCard';
import { useAuthStore } from '../../store/authStore';
import { RecipeRepository } from '../../repositories/RecipeRepository';
import { theme } from '../../constants/theme';
import { styles } from './styles';

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const { isLoggedIn, userId } = useAuthStore();
  const [favoriteRecipes, setFavoriteRecipes] = useState<any[]>([]);
  const [userFilters, setUserFilters] = useState({ allergies: [], prefs: [] });

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn && userId) {
        const filters = RecipeRepository.getUserFilters(userId) as any;
        setUserFilters(filters);
        
        const allFavorites = RecipeRepository.getFavoriteRecipes(userId);
        
        const safeFavorites = allFavorites.filter((recipe: any) => {
          try {
            const recipeAllergies = JSON.parse(recipe.contains_allergies || '[]');
            const recipePrefs = JSON.parse(recipe.suitable_for_prefs || '[]');
            
            const hasAllergy = filters.allergies.some((a: any) => recipeAllergies.includes(a));
            if (hasAllergy) return false;

            if (filters.prefs.length > 0) {
              const meetsPrefs = filters.prefs.every((p: any) => recipePrefs.includes(p));
              if (!meetsPrefs) return false;
            }

            return true;
          } catch (e) {
            return true;
          }
        });

        setFavoriteRecipes(safeFavorites);
      } else {
        setFavoriteRecipes([]);
        setUserFilters({ allergies: [], prefs: [] });
      }
    }, [isLoggedIn, userId])
  );

  const hasActiveSecurityFilters = userFilters.allergies.length > 0 || userFilters.prefs.length > 0;

  if (!isLoggedIn) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="heart-half-outline" size={80} color={theme.colors.border} style={{ marginBottom: 20 }} />
        <Text style={styles.title}>Suas receitas favoritas</Text>
        <Text style={styles.subtitle}>Faça login para começar a salvar os pratos que você mais ama e acessá-los rapidamente.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Fazer Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hasActiveSecurityFilters && favoriteRecipes.length > 0 && (
        <View style={styles.safeBanner}>
          <Ionicons name="shield-checkmark" size={16} color={theme.colors.card} />
          <Text style={styles.safeText}>Exibindo favoritos adaptados ao seu perfil.</Text>
        </View>
      )}

      {favoriteRecipes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="heart-outline" size={80} color={theme.colors.border} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>Você ainda não favoritou nenhuma receita que atenda ao seu perfil.</Text>
          <Text style={styles.emptySub}>Navegue pelo app e clique no coração!</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteRecipes}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <RecipeCard 
              title={item.title} 
              time={`${item.time_minutes} min`}
              imageUrl={item.image_url}
              rating={item.rating}
              onPress={() => navigation.navigate('RecipeDetails', { id: item.id })} 
            />
          )}
        />
      )}
    </View>
  );
}