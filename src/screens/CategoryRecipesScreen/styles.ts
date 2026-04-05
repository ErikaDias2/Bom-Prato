import { StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: theme.spacing.md },
  emptyText: { fontSize: 16, color: theme.colors.textLight }
});