import { useState, useCallback } from 'react';
import { View, FlatList, TextInput, Text, TouchableOpacity, Modal } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import RecipeCard from '../../components/RecipeCard';
import Chip from '../../components/Chip';
import { useAuthStore } from '../../store/authStore';
import { RecipeRepository } from '../../repositories/RecipeRepository';
import { theme } from '../../constants/theme';
import { styles } from './styles';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { isLoggedIn, userId } = useAuthStore();
  
  const [recipes, setRecipes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [userFilters, setUserFilters] = useState({ allergies: [], prefs: [] });

  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterDifficulty, setFilterDifficulty] = useState('Todas');
  const [filterTime, setFilterTime] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const filters = RecipeRepository.getUserFilters(isLoggedIn ? userId : null);
      setUserFilters(filters as any);

      const filteredRecipes = RecipeRepository.getFilteredRecipes(
        searchQuery, filterCategory, filterDifficulty, filterTime, filters.allergies, filters.prefs
      );
      setRecipes(filteredRecipes);

    }, [isLoggedIn, userId, searchQuery, filterCategory, filterDifficulty, filterTime])
  );

  const hasActiveSecurityFilters = userFilters.allergies.length > 0 || userFilters.prefs.length > 0;

  return (
    <View style={styles.container}>
      {hasActiveSecurityFilters && (
        <View style={styles.safeBanner}>
          <Ionicons name="shield-checkmark" size={16} color={theme.colors.card} />
          <Text style={styles.safeText}>Exibindo receitas adaptadas ao seu perfil.</Text>
        </View>
      )}

      <View style={styles.topRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="O que vamos cozinhar hoje?"
            placeholderTextColor={theme.colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <Ionicons name="options" size={24} color={theme.colors.card} />
        </TouchableOpacity>
      </View>

      {recipes.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Nenhuma receita encontrada para o seu perfil. 🍳</Text>
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
              rating={item.rating}
              imageUrl={item.image_url}
              onPress={() => navigation.navigate('RecipeDetails', { id: item.id })} 
            />
          )}
        />
      )}

      <Modal visible={showFilters} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>Categoria</Text>
            <View style={styles.chipsRow}>
              {['Todas', 'Almoço', 'Sobremesa', 'Fitness', 'Jantar'].map(cat => (
                <Chip 
                  key={cat} 
                  label={cat} 
                  isActive={filterCategory === cat} 
                  onPress={() => setFilterCategory(cat)} 
                />
              ))}
            </View>

            <Text style={styles.filterLabel}>Dificuldade</Text>
            <View style={styles.chipsRow}>
              {['Todas', 'Fácil', 'Média', 'Difícil'].map(diff => (
                <Chip 
                  key={diff} 
                  label={diff} 
                  isActive={filterDifficulty === diff} 
                  onPress={() => setFilterDifficulty(diff)} 
                />
              ))}
            </View>

            <Text style={styles.filterLabel}>Tempo Máximo</Text>
            <View style={styles.chipsRow}>
              {[0, 15, 30, 60].map(time => (
                <Chip 
                  key={time} 
                  label={time === 0 ? 'Qualquer' : `Até ${time} min`} 
                  isActive={filterTime === time} 
                  onPress={() => setFilterTime(time)} 
                />
              ))}
            </View>

            <TouchableOpacity style={styles.applyButton} onPress={() => setShowFilters(false)}>
              <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}