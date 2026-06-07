import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { UserRepository } from '../../repositories/UserRepository';
import { RecipeRepository } from '../../repositories/RecipeRepository';
import { theme } from '../../constants/theme';

export default function CustomCategoriesScreen() {
  const navigation = useNavigation<any>();
  const { userId } = useAuthStore();

  const [categories, setCategories] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState('');
  const [allRecipes, setAllRecipes] = useState<any[]>([]);
  const [modalCategory, setModalCategory] = useState('Todas');
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<number[]>([]);
  const [existingRecipeIds, setExistingRecipeIds] = useState<number[]>([]);

  const loadData = useCallback(() => {
    if (userId) {
      setCategories(UserRepository.getCustomCategories(userId));
      setAllRecipes(RecipeRepository.getFilteredRecipes('', 'Todas', 'Todas', 0, [], []));
    }
  }, [userId]);

  useFocusEffect(loadData);

  const handleCreate = () => {
    if (!newCatName.trim() || !userId) return;
    UserRepository.addCustomCategory(userId, newCatName.trim());
    setNewCatName('');
    setShowModal(false);
    loadData();
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert('Excluir', `Apagar a categoria "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: () => {
          UserRepository.removeCustomCategory(id);
          loadData();
        },
      },
    ]);
  };

  const handleCategoryPress = (category: any) => {
    Alert.alert(category.name, 'O que deseja fazer?', [
      {
        text: '➕  Adicionar Receitas',
        onPress: () => {
          const existingRecipes = UserRepository.getRecipesByCategory(category.id) || [];
          const existingIds = existingRecipes.map((r: any) => r.id);
          
          setActiveCategoryId(category.id);
          setActiveCategoryName(category.name);
          setExistingRecipeIds(existingIds);
          setSelectedRecipeIds([]); 
          setModalCategory('Todas');
          setShowRecipeModal(true);
        },
      },
      {
        text: '📖  Ver Receitas',
        onPress: () =>
          navigation.navigate('CategoryRecipes', {
            categoryName: category.name,
            categoryId: category.id,
          }),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const toggleSelectRecipe = (id: number) => {
    setSelectedRecipeIds((prev) => 
      prev.includes(id) ? prev.filter(recipeId => recipeId !== id) : [...prev, id]
    );
  };

  const handleSaveRecipes = () => {
    if (activeCategoryId && selectedRecipeIds.length > 0) {
      selectedRecipeIds.forEach(id => {
        UserRepository.addRecipeToCategory(activeCategoryId, id);
      });
      
      Alert.alert(
        'Sucesso! 🎉', 
        `${selectedRecipeIds.length} receita(s) adicionada(s) à categoria "${activeCategoryName}".`
      );
      
      setShowRecipeModal(false);
      setSelectedRecipeIds([]);
    }
  };

  const recipesToDisplay = allRecipes.filter(
    r => modalCategory === 'Todas' || r.category === modalCategory
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color={theme.colors.border} />
            <Text style={styles.emptyTitle}>Nenhuma categoria ainda</Text>
            <Text style={styles.emptySubtitle}>
              Toque em "Criar Nova Categoria" para começar a organizar suas receitas.
            </Text>
          </View>
        }
        ListHeaderComponent={
          <TouchableOpacity style={styles.addCard} onPress={() => setShowModal(true)}>
            <Ionicons name="add-circle" size={40} color={theme.colors.primary} />
            <Text style={styles.addCardText}>Criar Nova Categoria</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.75}
            onPress={() => handleCategoryPress(item)}
            onLongPress={() => handleDelete(item.id, item.name)}
          >
            <Ionicons name="folder-open" size={36} color={theme.colors.secondary} style={{ marginBottom: 10 }} />
            <Text style={styles.cardText} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.cardHint}>Toque para opções</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Categoria</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Receitas de Natal..."
              value={newCatName}
              onChangeText={setNewCatName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate} style={styles.saveBtn}>
                <Text style={styles.saveText}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showRecipeModal} animationType="slide" transparent>
        <View style={styles.recipeModalOverlay}>
          <View style={styles.recipeModalContent}>
            
            <View style={styles.recipeModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.recipeModalTitle}>Escolha as Receitas</Text>
                <Text style={styles.recipeModalSubtitle}>Para "{activeCategoryName}"</Text>
              </View>
              <TouchableOpacity onPress={() => setShowRecipeModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ paddingBottom: 16 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {['Todas', 'Almoço', 'Jantar', 'Sobremesa', 'Fitness'].map(cat => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.categoryChip, modalCategory === cat && styles.categoryChipActive]}
                    onPress={() => setModalCategory(cat)}
                  >
                    <Text style={[styles.categoryChipText, modalCategory === cat && styles.categoryChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <FlatList
              data={recipesToDisplay}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 130 }}
              renderItem={({ item }) => {
                const isAlreadyAdded = existingRecipeIds.includes(item.id);
                const isSelected = selectedRecipeIds.includes(item.id);

                return (
                  <TouchableOpacity 
                    style={[
                      styles.recipeListItem, 
                      isSelected && styles.recipeListItemSelected,
                      isAlreadyAdded && styles.recipeListItemAlreadyAdded
                    ]} 
                    activeOpacity={isAlreadyAdded ? 1 : 0.7}
                    onPress={() => {
                      if (!isAlreadyAdded) toggleSelectRecipe(item.id);
                    }}
                  >
                    <Image 
                      source={{ uri: item.image_url }} 
                      style={[styles.recipeListImage, isAlreadyAdded && { opacity: 0.5 }]} 
                    />
                    <View style={styles.recipeListInfo}>
                      <Text style={[styles.recipeListTitle, isAlreadyAdded && { color: theme.colors.textLight }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.recipeListDetails}>{item.time_minutes} min • {item.category}</Text>
                    </View>
                    {isAlreadyAdded ? (
                      <View style={{ alignItems: 'center' }}>
                        <Ionicons name="checkmark-done-circle" size={24} color={theme.colors.textLight} />
                        <Text style={{ fontSize: 10, color: theme.colors.textLight, marginTop: 2 }}>Adicionada</Text>
                      </View>
                    ) : (
                      <Ionicons 
                        name={isSelected ? "checkmark-circle" : "add-circle-outline"} 
                        size={28} 
                        color={isSelected ? theme.colors.primary : theme.colors.textLight} 
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            <View style={styles.saveRecipesBtnContainer}>
               <TouchableOpacity 
                  style={[styles.saveRecipesBtn, selectedRecipeIds.length === 0 && styles.saveRecipesBtnDisabled]}
                  onPress={handleSaveRecipes}
                  disabled={selectedRecipeIds.length === 0}
               >
                 <Text style={styles.saveRecipesBtnText}>
                   {selectedRecipeIds.length === 0 
                     ? 'Selecione as Receitas' 
                     : `Adicionar ${selectedRecipeIds.length} ${selectedRecipeIds.length === 1 ? 'Receita' : 'Receitas'}`
                   }
                 </Text>
               </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  list: { padding: 16, flexGrow: 1 },
  row: { justifyContent: 'space-between', marginBottom: 16 },

  addCard: { width: '100%', backgroundColor: '#FFF5F0', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: theme.colors.primary },
  addCardText: { color: theme.colors.primary, fontWeight: 'bold', marginTop: 8 },

  card: { width: '48%', backgroundColor: '#FFF', padding: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, minHeight: 120 },
  cardText: { fontWeight: 'bold', color: theme.colors.text, textAlign: 'center', fontSize: 14 },
  cardHint: { fontSize: 11, color: theme.colors.textLight, marginTop: 4 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 20 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: theme.colors.textLight, textAlign: 'center', lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', padding: 24, borderRadius: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 8, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  cancelBtn: { padding: 10 },
  cancelText: { color: theme.colors.textLight, fontWeight: 'bold' },
  saveBtn: { backgroundColor: theme.colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  saveText: { color: '#FFF', fontWeight: 'bold' },

  recipeModalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  recipeModalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%', padding: 20, position: 'relative' },
  recipeModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  recipeModalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  recipeModalSubtitle: { fontSize: 14, color: theme.colors.primary, marginTop: 2 },
  
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0' },
  categoryChipActive: { backgroundColor: theme.colors.primary },
  categoryChipText: { color: theme.colors.textLight, fontSize: 14, fontWeight: '500' },
  categoryChipTextActive: { color: '#FFF' },
  
  recipeListItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: 'transparent' },
  recipeListItemSelected: { backgroundColor: '#FFF5F0', borderColor: theme.colors.primaryLight },
  recipeListItemAlreadyAdded: { backgroundColor: '#F0F0F0', opacity: 0.8 },
  recipeListImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#E0E0E0' },
  recipeListInfo: { flex: 1, marginLeft: 12 },
  recipeListTitle: { fontSize: 15, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
  recipeListDetails: { fontSize: 13, color: theme.colors.textLight },
  
  saveRecipesBtnContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 20, paddingBottom: 40, borderTopWidth: 1, borderColor: '#EEE' },
  saveRecipesBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveRecipesBtnDisabled: { backgroundColor: theme.colors.textLight, opacity: 0.6 },
  saveRecipesBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});