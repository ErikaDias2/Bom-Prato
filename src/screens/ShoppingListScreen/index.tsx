import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Share } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../store/authStore';
import { RecipeRepository } from '../../repositories/RecipeRepository';
import { theme } from '../../constants/theme';
import { styles } from './styles';

export default function ShoppingListScreen() {
  const route = useRoute<any>();
  const { startDate, endDate } = route.params;
  const { userId } = useAuthStore();

  const [ingredientsList, setIngredientsList] = useState<any[]>([]);
  const [customItems, setCustomItems] = useState<any[]>([]); 
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [newItemText, setNewItemText] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = `@shopping_list_${userId}_${startDate}_${endDate}`;
  useEffect(() => {
    const loadData = async () => {
      if (userId) {
        const weeklyPlan = RecipeRepository.getWeeklyPlan(userId, startDate, endDate);
        const aggregated: Record<string, any> = {};

        weeklyPlan.forEach((plan: any) => {
          const ingredients = JSON.parse(plan.ingredients || '[]');
          ingredients.forEach((ing: any) => {
            const unitNormalized = ing.unit.toLowerCase().trim().replace(/s$/, ''); 
            const nameNormalized = ing.name.toLowerCase().trim();
            const key = `${nameNormalized}_${unitNormalized}`;

            if (!aggregated[key]) {
              aggregated[key] = { name: ing.name, unit: unitNormalized, amount: 0, isCustom: false };
            }
            aggregated[key].amount += ing.amount;
          });
        });

        const finalArray = Object.values(aggregated).sort((a: any, b: any) => a.name.localeCompare(b.name));
        setIngredientsList(finalArray);
      }
      try {
        const savedData = await AsyncStorage.getItem(storageKey);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setCheckedItems(parsed.checkedItems || {});
          setCustomItems(parsed.customItems || []);
        }
      } catch (e) { console.error("Erro ao carregar lista:", e); }
      
      setIsLoaded(true);
    };

    loadData();
  }, [userId, startDate, endDate, storageKey]);
  useEffect(() => {
    if (isLoaded) {
      const saveData = async () => {
        try {
          const dataToSave = JSON.stringify({ checkedItems, customItems });
          await AsyncStorage.setItem(storageKey, dataToSave);
        } catch (e) { console.error("Erro ao salvar lista:", e); }
      };
      saveData();
    }
  }, [checkedItems, customItems, isLoaded, storageKey]);

  const toggleCheck = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddCustomItem = () => {
    if (newItemText.trim() === '') return;
    const newItem = {
      name: newItemText.trim(), amount: '', unit: '', isCustom: true,
      key: `custom_${Date.now()}` 
    };
    setCustomItems(prev => [newItem, ...prev]);
    setNewItemText('');
  };

  const handleRemoveCustomItem = (key: string) => {
    setCustomItems(prev => prev.filter(item => item.key !== key));
    const newChecked = { ...checkedItems };
    delete newChecked[key];
    setCheckedItems(newChecked);
  };

  const formatExibitionDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}`;
  };
  const fullList = [...customItems, ...ingredientsList];

  const handleShare = async () => {
    const listText = fullList.map(item => {
      const key = item.isCustom ? item.key : `${item.name}_${item.unit}`;
      const status = checkedItems[key] ? '✅' : '⬜';
      const amountStr = item.isCustom ? '' : `${item.amount} ${item.unit} de `;
      return `${status} ${amountStr}${item.name}${item.isCustom ? ' (Avulso)' : ''}`;
    }).join('\n');

    const message = `🛒 *Minha Lista de Compras*\n📅 Semana: ${formatExibitionDate(startDate)} a ${formatExibitionDate(endDate)}\n\n${listText}\n\n_Gerado pelo app Bom Prato_ 🥘`;

    try {
      await Share.share({ message, title: 'Lista de Compras' });
    } catch (error) { console.error(error); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.headerInfo}>
        <View style={styles.headerTextContainer}>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.headerText}>
            Semana de {formatExibitionDate(startDate)} até {formatExibitionDate(endDate)}
          </Text>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social" size={20} color="#FFF" />
          <Text style={styles.shareText}>Compartilhar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addItemContainer}>
        <TextInput
          style={styles.addItemInput}
          placeholder="Adicionar item avulso (ex: Pão)..."
          value={newItemText}
          onChangeText={setNewItemText}
          onSubmitEditing={handleAddCustomItem}
        />
        <TouchableOpacity style={styles.addItemButton} onPress={handleAddCustomItem}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {fullList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={theme.colors.textLight} />
          <Text style={styles.emptyText}>Sua lista de compras está vazia.</Text>
        </View>
      ) : (
        <FlatList
          data={fullList}
          keyExtractor={(item) => item.isCustom ? item.key : `${item.name}_${item.unit}`}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const key = item.isCustom ? item.key : `${item.name}_${item.unit}`;
            const isChecked = checkedItems[key];

            return (
              <TouchableOpacity style={styles.itemRow} onPress={() => toggleCheck(key)} activeOpacity={0.7}>
                <Ionicons name={isChecked ? "checkmark-circle" : "ellipse-outline"} size={24} color={isChecked ? theme.colors.primary : theme.colors.textLight} />
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, isChecked && styles.textCrossed]}>
                    {item.name} {item.isCustom && <Text style={styles.customBadge}> (Avulso)</Text>}
                  </Text>
                  {!item.isCustom && (
                    <Text style={[styles.itemAmount, isChecked && styles.textCrossed]}>
                      {item.amount} {item.unit}{item.amount > 1 && item.unit.length > 2 && !item.unit.endsWith('s') ? 's' : ''}
                    </Text>
                  )}
                </View>
                {item.isCustom && (
                  <TouchableOpacity onPress={() => handleRemoveCustomItem(item.key)} style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={20} color={theme.colors.textLight} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}