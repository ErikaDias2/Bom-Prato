import { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  TextInput,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import RecipeCard from '../../components/RecipeCard';
import Chip from '../../components/Chip';
import { useAuthStore } from '../../store/authStore';
import { RecipeRepository } from '../../repositories/RecipeRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { theme } from '../../constants/theme';
import { styles } from './styles';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isLoggedIn, userId } = useAuthStore();

  const [recipes, setRecipes] = useState<any[]>([]);
  const [seasonalRecipes, setSeasonalRecipes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilters, setUserFilters] = useState({ allergies: [], prefs: [] });

  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterDifficulty, setFilterDifficulty] = useState('Todas');
  const [filterTime, setFilterTime] = useState(0);
  const [selectMode, setSelectMode] = useState(false);
  const [selectCategoryId, setSelectCategoryId] = useState<number | null>(null);
  const [selectCategoryName, setSelectCategoryName] = useState('');
  const [selectedRecipes, setSelectedRecipes] = useState<number[]>([]);

  const getSeasonInfo = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4)
      return { title: '🍂 Receitas de Outono', keywords: ['Sopa', 'Risoto', 'Lasanha', 'Bolo'] };
    if (month >= 5 && month <= 7)
      return { title: '⛄ Receitas de Inverno', keywords: ['Sopa', 'Risoto', 'Lasanha', 'Estrogonofe', 'Feijoada'] };
    if (month >= 8 && month <= 10)
      return { title: '🌸 Receitas de Primavera', keywords: ['Salada', 'Frango', 'Mousse', 'Torta'] };
    return { title: '☀️ Receitas de Verão', keywords: ['Salada', 'Mousse', 'Peixe', 'Limão'] };
  };

  useFocusEffect(
    useCallback(() => {
      const { selectModeCategoryId, selectModeCategoryName } =
        (route.params as any) ?? {};

      if (selectModeCategoryId) {
        setSelectMode(true);
        setSelectCategoryId(selectModeCategoryId);
        setSelectCategoryName(selectModeCategoryName ?? '');
        setSelectedRecipes([]);
        navigation.setParams({
          selectModeCategoryId: undefined,
          selectModeCategoryName: undefined,
        });
      }

      const filters = RecipeRepository.getUserFilters(isLoggedIn ? userId : null);
      setUserFilters(filters as any);

      const filteredRecipes = RecipeRepository.getFilteredRecipes(
        searchQuery,
        filterCategory,
        filterDifficulty,
        filterTime,
        filters.allergies,
        filters.prefs
      );
      setRecipes(filteredRecipes);

      const seasonInfo = getSeasonInfo();
      const seasonals = filteredRecipes.filter((r: any) =>
        seasonInfo.keywords.some((kw) =>
          r.title.toLowerCase().includes(kw.toLowerCase())
        )
      );
      setSeasonalRecipes(seasonals.length > 0 ? seasonals : filteredRecipes.slice(0, 3));
    }, [isLoggedIn, userId, searchQuery, filterCategory, filterDifficulty, filterTime, route.params])
  );

  const toggleSelectRecipe = (id: number) => {
    setSelectedRecipes((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  const handleFinishSelection = () => {
    if (selectedRecipes.length === 0) {
      return Alert.alert('Aviso', 'Selecione pelo menos uma receita!');
    }
    selectedRecipes.forEach((recipeId) => {
      UserRepository.addRecipeToCategory(selectCategoryId!, recipeId);
    });
    Alert.alert(
      'Sucesso! 🎉',
      `${selectedRecipes.length} ${
        selectedRecipes.length === 1 ? 'receita adicionada' : 'receitas adicionadas'
      } a "${selectCategoryName}"!`
    );
    setSelectMode(false);
    setSelectCategoryId(null);
    setSelectCategoryName('');
    setSelectedRecipes([]);
    navigation.goBack();
  };

  const handleCancelSelection = () => {
    setSelectMode(false);
    setSelectCategoryId(null);
    setSelectCategoryName('');
    setSelectedRecipes([]);
    navigation.goBack();
  };

  const hasActiveSecurityFilters =
    userFilters.allergies.length > 0 || userFilters.prefs.length > 0;
  const seasonInfo = getSeasonInfo();

  if (selectMode) {
    return (
      <View style={styles.container}>
        <View style={selectStyles.header}>
          <View style={{ flex: 1 }}>
            <Text style={selectStyles.headerLabel}>Adicionando receitas à categoria</Text>
            <Text style={selectStyles.headerCat} numberOfLines={1}>
              "{selectCategoryName}"
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCancelSelection}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={32} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={[styles.topRow, selectStyles.searchRow]}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={theme.colors.primary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar receita..."
              placeholderTextColor={theme.colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selectedRecipes.includes(item.id);
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  selectStyles.cardWrapper,
                  isSelected && selectStyles.cardWrapperSelected,
                ]}
                onPress={() => toggleSelectRecipe(item.id)}
              >
                <View pointerEvents="none">
                  <RecipeCard
                    title={item.title}
                    time={`${item.time_minutes} min`}
                    imageUrl={item.image_url}
                    rating={item.rating}
                    onPress={() => {}}
                  />
                </View>
                <View
                  style={[
                    selectStyles.checkbox,
                    isSelected && selectStyles.checkboxSelected,
                  ]}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color="#FFF" />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <View style={selectStyles.floatingBtnContainer}>
          <TouchableOpacity
            style={[
              selectStyles.finishBtn,
              selectedRecipes.length === 0 && selectStyles.finishBtnDisabled,
            ]}
            onPress={handleFinishSelection}
          >
            <Ionicons
              name="checkmark-circle"
              size={22}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Text style={selectStyles.finishBtnText}>
              {selectedRecipes.length === 0
                ? 'Selecione receitas'
                : `Adicionar ${selectedRecipes.length} receita${
                    selectedRecipes.length > 1 ? 's' : ''
                  }`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderHeader = () => (
    <View>
      {hasActiveSecurityFilters && (
        <View style={styles.safeBanner}>
          <Ionicons name="shield-checkmark" size={16} color={theme.colors.card} />
          <Text style={styles.safeText}>
            Exibindo receitas adaptadas ao seu perfil.
          </Text>
        </View>
      )}

      <View style={styles.topRow}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.primary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="O que vamos cozinhar?"
            placeholderTextColor={theme.colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate('Glossary')}
        >
          <Ionicons name="library" size={24} color={theme.colors.card} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={24} color={theme.colors.card} />
        </TouchableOpacity>
      </View>

      {seasonalRecipes.length > 0 && searchQuery === '' && (
        <View>
          <Text style={styles.sectionTitle}>{seasonInfo.title}</Text>
          <FlatList
            horizontal
            data={seasonalRecipes}
            keyExtractor={(item) => `season-${item.id}`}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.horizontalCardWrapper}>
                <RecipeCard
                  title={item.title}
                  time={`${item.time_minutes} min`}
                  rating={item.rating}
                  imageUrl={item.image_url}
                  onPress={() =>
                    navigation.navigate('RecipeDetails', { id: item.id })
                  }
                />
              </View>
            )}
          />
        </View>
      )}

      <Text style={styles.sectionTitle}>Todas as Receitas</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {recipes.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Nenhuma receita encontrada. 🍳</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <RecipeCard
              title={item.title}
              time={`${item.time_minutes} min`}
              rating={item.rating}
              imageUrl={item.image_url}
              onPress={() =>
                navigation.navigate('RecipeDetails', { id: item.id })
              }
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
              {['Todas', 'Almoço', 'Sobremesa', 'Fitness', 'Jantar'].map(
                (cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    isActive={filterCategory === cat}
                    onPress={() => setFilterCategory(cat)}
                  />
                )
              )}
            </View>

            <Text style={styles.filterLabel}>Dificuldade</Text>
            <View style={styles.chipsRow}>
              {['Todas', 'Fácil', 'Média', 'Difícil'].map((diff) => (
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
              {[0, 15, 30, 60].map((time) => (
                <Chip
                  key={time}
                  label={time === 0 ? 'Qualquer' : `Até ${time} min`}
                  isActive={filterTime === time}
                  onPress={() => setFilterTime(time)}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const selectStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 2,
  },
  headerCat: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cardWrapper: {
    position: 'relative',
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardWrapperSelected: {
    borderColor: theme.colors.primary,
  },
  checkbox: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  floatingBtnContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  finishBtn: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  finishBtnDisabled: {
    opacity: 0.6,
  },
  finishBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});