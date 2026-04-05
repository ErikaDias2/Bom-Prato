import { StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, margin: theme.spacing.md, borderRadius: theme.borderRadius.md, paddingHorizontal: 12, elevation: 2 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 48, fontSize: 16, color: theme.colors.text },
  listContainer: { paddingHorizontal: theme.spacing.md, paddingBottom: 20 },
  card: { backgroundColor: theme.colors.card, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: 12, elevation: 2 },
  term: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 4 },
  desc: { fontSize: 15, color: theme.colors.text, lineHeight: 22 }
});