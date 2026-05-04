import { StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  
  unauthContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  unauthTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text, marginTop: 16, marginBottom: 8 },
  unauthText: { fontSize: 16, color: theme.colors.textLight, textAlign: 'center', marginBottom: 24 },
  loginButton: { backgroundColor: theme.colors.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8 },
  loginButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  calendarContainer: { backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  arrowArea: { padding: 8 },
  monthSelectorBtn: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  monthText: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingBottom: 16 },
  dayContainer: { alignItems: 'center', justifyContent: 'center', width: 45, height: 62, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  dayContainerSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  dayContainerToday: { borderColor: theme.colors.primary, borderWidth: 1.5, backgroundColor: '#FFF5F0' },
  dayName: { fontSize: 12, color: theme.colors.textLight, marginBottom: 4 },
  dayNumber: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  textSelected: { color: '#FFF' },
  textToday: { color: theme.colors.primary, fontWeight: 'bold' },
  
  dotsRow: { flexDirection: 'row', marginTop: 4, gap: 2, height: 6 },
  dot: { width: 5, height: 5, borderRadius: 3 },

  mealsContainer: { padding: 20 },
  selectedDateText: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textLight, marginBottom: 16 },
  mealSlot: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  mealHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  mealColorTag: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  mealTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  
  plannedCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9F9F9', padding: 14, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  plannedRecipeTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.text, flex: 1 },
  
  addMealBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1, borderColor: theme.colors.primary, borderStyle: 'dashed', borderRadius: 8, backgroundColor: '#FFF5F0', marginTop: 4 },
  addMealText: { color: theme.colors.primary, fontWeight: '600', marginLeft: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  recipeListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  recipeListImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  recipeListInfo: { flex: 1 },
  recipeListTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
  recipeListDetails: { fontSize: 12, color: theme.colors.textLight },


  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  datePickerContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, width: '100%', maxWidth: 340 },
  yearRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  yearText: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  monthGridItem: { width: '30%', paddingVertical: 14, alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, marginBottom: 10 },
  monthGridText: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  closePickerBtn: { marginTop: 10, paddingVertical: 12, alignItems: 'center' },
  closePickerText: { color: theme.colors.textLight, fontSize: 16, fontWeight: 'bold' },
  

  shoppingListBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: 10, marginBottom: 20 },
  shoppingListBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },

  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
});