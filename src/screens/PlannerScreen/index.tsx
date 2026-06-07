import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, Image, ScrollView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '../../store/authStore';
import { RecipeRepository } from '../../repositories/RecipeRepository';
import { theme } from '../../constants/theme';
import { styles } from './styles';

const MEAL_COLORS = {
  breakfast: '#FFC107', 
  lunch: '#4CAF50',     
  dinner: '#9C27B0'     
};

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function PlannerScreen() {
  const navigation = useNavigation<any>();
  const { isLoggedIn, userId } = useAuthStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [modalVisible, setModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [mealTime, setMealTime] = useState(new Date());

  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null);
  const [allRecipes, setAllRecipes] = useState<any[]>([]);
  const [plannedMeals, setPlannedMeals] = useState<Record<string, any>>({});
  const [modalCategory, setModalCategory] = useState('Todas');
  const touchStartX = useRef(0);

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); 
    
    return Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  }, [currentDate]);

  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];
  const selectedDateKey = formatDateKey(selectedDate);
  const todayKey = formatDateKey(new Date());

  const loadPlan = useCallback(() => {
    if (isLoggedIn && userId) {
      const start = formatDateKey(weekDays[0]);
      const end = formatDateKey(weekDays[6]);
      const results = RecipeRepository.getWeeklyPlan(userId, start, end);
      
      const planObj: any = {};
      results.forEach((item: any) => {
        if (!planObj[item.date]) planObj[item.date] = { breakfast: [], lunch: [], dinner: [] };
        if (!planObj[item.date][item.meal_type]) planObj[item.date][item.meal_type] = [];
        
        planObj[item.date][item.meal_type].push(item);
      });
      setPlannedMeals(planObj);
    }
  }, [isLoggedIn, userId, weekDays]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      const all = RecipeRepository.getFilteredRecipes('', 'Todas', 'Todas', 0, [], []);
      setAllRecipes(all);
      loadPlan();
    }
  }, [isLoggedIn, userId, loadPlan]);

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleTouchStart = (e: any) => { touchStartX.current = e.nativeEvent.pageX; };
  const handleTouchEnd = (e: any) => {
    const touchEndX = e.nativeEvent.pageX;
    if (touchStartX.current - touchEndX > 50) goToNextWeek();
    if (touchEndX - touchStartX.current > 50) goToPreviousWeek();
  };

  const handleAddMeal = (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setSelectedMealType(mealType);
    setModalVisible(true);
  };

  const handleSelectRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
    setModalVisible(false);
    
    Alert.alert(
      "Adicionar Lembrete?",
      "Deseja ser notificado no horário do preparo desta refeição?",
      [
        {
          text: "Não",
          style: "cancel",
          onPress: () => saveMealPlan(recipe, false)
        },
        {
          text: "Sim",
          onPress: () => {
            const defaultTime = new Date();
            if (selectedMealType === 'breakfast') defaultTime.setHours(8, 0, 0);
            else if (selectedMealType === 'lunch') defaultTime.setHours(12, 0, 0);
            else defaultTime.setHours(19, 0, 0);
            
            setMealTime(defaultTime);
            setShowTimePicker(true); 
          }
        }
      ]
    );
  };

  const saveMealPlan = async (recipe: any, scheduleNotification: boolean, timeToSchedule?: Date) => {
    if (userId && selectedMealType && recipe) {
      let notificationId = null;

      if (scheduleNotification && timeToSchedule) {
        const triggerDate = new Date(selectedDate);
        triggerDate.setHours(timeToSchedule.getHours(), timeToSchedule.getMinutes(), 0, 0);

        if (triggerDate.getTime() > Date.now()) {
          const mealNames = { breakfast: 'Café da Manhã', lunch: 'Almoço', dinner: 'Jantar' };

          if (Platform.OS === 'android') {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert("Permissão negada", "Ative as notificações nas configurações.");
              return;
            }
          }

          if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
              name: 'Lembretes de Refeição',
              importance: Notifications.AndroidImportance.MAX,
            });
          }
          
          try {
            notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: "Hora de Cozinhar! 👨‍🍳",
                body: `Seu ${mealNames[selectedMealType]} está planejado: ${recipe.title}. Clique para ver a receita.`,
                data: { recipeStr: JSON.stringify(recipe) },
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
                channelId: 'default',
              },
            });
          } catch (error) {
            console.error("Erro ao agendar notificação:", error);
          }
        } else {
          Alert.alert("Aviso", "O horário escolhido já passou. A refeição foi salva, mas sem o lembrete.");
        }
      }

      RecipeRepository.addToPlan(userId, recipe.id, selectedDateKey, selectedMealType, notificationId);
      
      setShowTimePicker(false);
      setSelectedRecipe(null);
      loadPlan(); 
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (event.type === "set" && selectedTime) {
        saveMealPlan(selectedRecipe, true, selectedTime);
      }
    } else {
      if (selectedTime) {
        setMealTime(selectedTime);
      }
    }
  };

  const confirmMealAndNotificationIOS = () => {
    saveMealPlan(selectedRecipe, true, mealTime);
  };

  const removeRecipeFromMeal = async (plan: any) => {
    if (userId) {
      if (plan.notification_id) {
        await Notifications.cancelScheduledNotificationAsync(plan.notification_id);
      }
      RecipeRepository.removeFromPlan(plan.plan_id);
      loadPlan();
    }
  };

  const handleSelectMonth = (monthIndex: number) => {
    const newDate = new Date(pickerYear, monthIndex, 1);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
    setDatePickerVisible(false);
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.unauthContainer}>
        <Ionicons name="calendar" size={80} color={theme.colors.textLight} />
        <Text style={styles.unauthTitle}>Planeje sua Semana</Text>
        <Text style={styles.unauthText}>Crie um cardápio semanal personalizado.</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginButtonText}>Fazer Login para Começar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentDayPlan = plannedMeals[selectedDateKey] || { breakfast: [], lunch: [], dinner: [] };
  const recipesToDisplay = allRecipes.filter(r => modalCategory === 'Todas' || r.category === modalCategory);

  return (
    <View style={styles.container}>
      <View 
        style={styles.calendarContainer} 
        onTouchStart={handleTouchStart} 
        onTouchEnd={handleTouchEnd}
      >
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousWeek} style={styles.arrowArea}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.monthSelectorBtn} onPress={() => {
            setPickerYear(currentDate.getFullYear());
            setDatePickerVisible(true);
          }}>
            <Text style={styles.monthText}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <Ionicons name="caret-down" size={16} color={theme.colors.primary} style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity onPress={goToNextWeek} style={styles.arrowArea}>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekRow}>
          {weekDays.map((day, index) => {
            const dayKey = formatDateKey(day);
            const isSelected = dayKey === selectedDateKey;
            const isToday = dayKey === todayKey;
            const dayPlan = plannedMeals[dayKey] || { breakfast: [], lunch: [], dinner: [] };

            return (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.dayContainer, 
                  isSelected && styles.dayContainerSelected,
                  isToday && !isSelected && styles.dayContainerToday 
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <Text style={[styles.dayName, isSelected && styles.textSelected, isToday && !isSelected && styles.textToday]}>
                  {dayNames[day.getDay()]}
                </Text>
                <Text style={[styles.dayNumber, isSelected && styles.textSelected, isToday && !isSelected && styles.textToday]}>
                  {day.getDate()}
                </Text>
                
                <View style={styles.dotsRow}>
                  {dayPlan.breakfast?.length > 0 && <View style={[styles.dot, { backgroundColor: MEAL_COLORS.breakfast }]} />}
                  {dayPlan.lunch?.length > 0 && <View style={[styles.dot, { backgroundColor: MEAL_COLORS.lunch }]} />}
                  {dayPlan.dinner?.length > 0 && <View style={[styles.dot, { backgroundColor: MEAL_COLORS.dinner }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView style={styles.mealsContainer} showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={styles.shoppingListBtn} 
          onPress={() => navigation.navigate('ShoppingList', { 
            startDate: formatDateKey(weekDays[0]), 
            endDate: formatDateKey(weekDays[6]) 
          })}
        >
          <Ionicons name="cart-outline" size={20} color="#FFF" />
          <Text style={styles.shoppingListBtnText}>Gerar Lista de Compras da Semana</Text>
        </TouchableOpacity>

        <Text style={styles.selectedDateText}>
          Planejamento para {selectedDate.getDate()} de {monthNames[selectedDate.getMonth()]}
        </Text>
        {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => {
          const mealNames = { breakfast: 'Café da Manhã', lunch: 'Almoço', dinner: 'Jantar' };
          const recipesInMeal = currentDayPlan[mealType] || [];

          return (
            <View key={mealType} style={styles.mealSlot}>
              <View style={styles.mealHeader}>
                <View style={[styles.mealColorTag, { backgroundColor: MEAL_COLORS[mealType] }]} />
                <Text style={styles.mealTitle}>{mealNames[mealType]}</Text>
              </View>
              
              {recipesInMeal.map((plan: any) => (
                <View key={plan.plan_id} style={styles.plannedCard}>
                  <Text style={styles.plannedRecipeTitle}>{plan.title}</Text>
                  <TouchableOpacity onPress={() => removeRecipeFromMeal(plan)}>
                    <Ionicons name="trash-outline" size={20} color={theme.colors.textLight} />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.addMealBtn} onPress={() => handleAddMeal(mealType)}>
                <Ionicons name="add" size={20} color={theme.colors.primary} />
                <Text style={styles.addMealText}>
                  {recipesInMeal.length > 0 ? 'Adicionar mais' : 'Adicionar Receita'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolha uma Receita</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setModalCategory('Todas'); setSelectedRecipe(null); }}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <View style={{ marginBottom: 16 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['Todas', 'Almoço', 'Jantar', 'Sobremesa', 'Fitness'].map(cat => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[
                      styles.categoryChip, 
                      modalCategory === cat && styles.categoryChipActive
                    ]}
                    onPress={() => setModalCategory(cat)}
                  >
                    <Text style={[
                      styles.categoryChipText, 
                      modalCategory === cat && styles.categoryChipTextActive
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <FlatList
              data={recipesToDisplay}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.recipeListItem} onPress={() => handleSelectRecipe(item)}>
                  <Image source={{ uri: item.image_url }} style={styles.recipeListImage} />
                  <View style={styles.recipeListInfo}>
                    <Text style={styles.recipeListTitle}>{item.title}</Text>
                    <Text style={styles.recipeListDetails}>{item.time_minutes} min • {item.category}</Text>
                  </View>
                  <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
      <Modal visible={datePickerVisible} animationType="fade" transparent>
        <View style={styles.modalOverlayCenter}>
          <View style={styles.datePickerContent}>
            <View style={styles.yearRow}>
              <TouchableOpacity onPress={() => setPickerYear(y => y - 1)} style={styles.arrowArea}>
                <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.yearText}>{pickerYear}</Text>
              <TouchableOpacity onPress={() => setPickerYear(y => y + 1)} style={styles.arrowArea}>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.monthGrid}>
              {monthNames.map((m, i) => (
                <TouchableOpacity key={m} style={styles.monthGridItem} onPress={() => handleSelectMonth(i)}>
                  <Text style={styles.monthGridText}>{m.substring(0, 3)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.closePickerBtn} onPress={() => setDatePickerVisible(false)}>
              <Text style={styles.closePickerText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {showTimePicker && (
        <>
          {Platform.OS === 'ios' ? (
            <Modal transparent animationType="slide">
              <View style={styles.modalOverlayCenter}>
                <View style={[styles.datePickerContent, { alignItems: 'center' }]}>
                  <Text style={styles.modalTitle}>Horário do Lembrete</Text>
                  <DateTimePicker
                    value={mealTime}
                    mode="time"
                    display="spinner"
                    onChange={onTimeChange}
                  />
                  <TouchableOpacity style={styles.loginButton} onPress={confirmMealAndNotificationIOS}>
                    <Text style={styles.loginButtonText}>Confirmar e Salvar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.closePickerBtn, {marginTop: 10}]} onPress={() => { setShowTimePicker(false); setSelectedRecipe(null); }}>
                    <Text style={styles.closePickerText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={mealTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onTimeChange}
            />
          )}
        </>
      )}

    </View>
  );
}