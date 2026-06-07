import { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import RecipeCard from '../../components/RecipeCard';
import { useAuthStore } from '../../store/authStore';
import { UserRepository } from '../../repositories/UserRepository';
import { RecipeRepository } from '../../repositories/RecipeRepository';
import { theme } from '../../constants/theme';

export default function CategoryRecipesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isLoggedIn, userId } = useAuthStore();
  const { categoryName, categoryId } = route.params ?? {};
  const [recipes, setRecipes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<any[]>([]);

  const loadRecipes = useCallback(() => {
    navigation.setOptions({ title: categoryName });

    let found: any[] = [];

    if (categoryId && userId) {
      found = UserRepository.getRecipesByCategory(categoryId);
      
    } else {
      found = RecipeRepository.getRecipesByCategory(
        categoryName,
        isLoggedIn ? userId : null
      );
    }

    setRecipes(found);
    setFilteredRecipes(found);
  }, [categoryName, categoryId, isLoggedIn, userId]);

  useFocusEffect(loadRecipes);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredRecipes(recipes);
    } else {
      const lower = text.toLowerCase();
      setFilteredRecipes(
        recipes.filter((r: any) => r.title.toLowerCase().includes(lower))
      );
    }
  };

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={theme.colors.primary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={`Buscar em "${categoryName}"...`}
          placeholderTextColor={theme.colors.textLight}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.counter}>
        {filteredRecipes.length}{' '}
        {filteredRecipes.length === 1 ? 'receita' : 'receitas'}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="restaurant-outline" size={64} color={theme.colors.border} />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'Nenhum resultado' : 'Categoria vazia'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? `Nenhuma receita encontrada para "${searchQuery}".`
          : 'Adicione receitas a esta categoria pelo botão de pastas nas receitas.'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          filteredRecipes.length === 0 && styles.listContainerEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  listContainer: {
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  listContainerEmpty: {
    flexGrow: 1,
  },

  headerBlock: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
  },
  counter: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginBottom: 4,
    paddingHorizontal: 4,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});