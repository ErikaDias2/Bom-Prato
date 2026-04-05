import { StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: theme.colors.textLight, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  button: { backgroundColor: theme.colors.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 25, width: '100%', alignItems: 'center' },
  buttonText: { color: theme.colors.card, fontSize: 16, fontWeight: 'bold' },
  listContainer: { padding: theme.spacing.md },
  emptyText: { fontSize: 18, color: theme.colors.textLight, fontWeight: 'bold', textAlign: 'center' },
  emptySub: { fontSize: 14, color: theme.colors.textLight, marginTop: 8, textAlign: 'center' },

  safeBanner: { flexDirection: 'row', backgroundColor: theme.colors.success, padding: theme.spacing.sm, justifyContent: 'center', alignItems: 'center', gap: 6 },
  safeText: { color: theme.colors.card, fontSize: 12, fontWeight: 'bold' },
});