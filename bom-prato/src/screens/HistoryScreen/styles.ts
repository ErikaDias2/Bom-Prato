import { StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
  listContainer: { padding: theme.spacing.md },
  card: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.md, overflow: 'hidden', elevation: 3 },
  image: { width: '100%', height: 140 },
  infoContainer: { padding: theme.spacing.md },
  title: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 4 },
  date: { fontSize: 14, color: theme.colors.textLight, marginBottom: 8, fontWeight: 'bold' },
  noteBox: { backgroundColor: theme.colors.primaryLight, padding: 12, borderRadius: 8, marginTop: 4 },
  noteText: { fontSize: 14, color: theme.colors.text, fontStyle: 'italic' },
  emptyText: { fontSize: 18, color: theme.colors.textLight, fontWeight: 'bold', textAlign: 'center' },
  emptySub: { fontSize: 14, color: theme.colors.textLight, marginTop: 8, textAlign: 'center' }
});