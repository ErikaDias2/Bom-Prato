import { useState, useCallback } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import RecipeCard from '../../components/RecipeCard';
import { useAuthStore } from '../../store/authStore';
import { RecipeRepository } from '../../repositories/RecipeRepository';
import { styles } from './styles';

export default function CategoryRecipesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isLoggedIn, userId } = useAuthStore();
  
  const { categoryName } = route.params; 
  const [recipes, setRecipes] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({ title: categoryName });
      const filtered = RecipeRepository.getRecipesByCategory(categoryName, isLoggedIn ? userId : null);
      setRecipes(filtered);
    }, [categoryName, isLoggedIn, userId])
  );

  return (
    <View style={styles.container}>
      {recipes.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Nenhuma receita segura encontrada. 🍳</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
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