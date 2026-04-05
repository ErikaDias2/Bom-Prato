import { StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  safeBanner: { flexDirection: 'row', backgroundColor: theme.colors.success, padding: theme.spacing.sm, justifyContent: 'center', alignItems: 'center', gap: 6 },
  safeText: { color: theme.colors.card, fontSize: 12, fontWeight: 'bold' },
  
  topRow: { flexDirection: 'row', alignItems: 'center', margin: theme.spacing.md, gap: 12 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, paddingHorizontal: theme.spacing.md, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  searchIcon: { marginRight: theme.spacing.sm },
  searchInput: { flex: 1, height: 48, fontSize: 16, color: theme.colors.text },
  filterButton: { backgroundColor: theme.colors.primary, padding: 12, borderRadius: theme.borderRadius.md, elevation: 2 },
  
  listContainer: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.md },
  emptyText: { fontSize: 16, color: theme.colors.textLight, marginTop: 20 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.card, padding: theme.spacing.lg, borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  filterLabel: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textLight, marginBottom: 10, marginTop: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  
  applyButton: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, alignItems: 'center', marginTop: 20 },
  applyButtonText: { color: theme.colors.card, fontSize: 18, fontWeight: 'bold' }
});