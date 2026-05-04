import { StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
  listContainer: { padding: theme.spacing.md },
  infoContainer: { padding: theme.spacing.md },
  title: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 4 },
  date: { fontSize: 14, color: theme.colors.textLight, marginBottom: 8, fontWeight: 'bold' },
  noteBox: { backgroundColor: theme.colors.primaryLight, padding: 12, borderRadius: 8, marginTop: 4 },
  noteText: { fontSize: 14, color: theme.colors.text, fontStyle: 'italic' },
  emptyText: { fontSize: 18, color: theme.colors.textLight, fontWeight: 'bold', textAlign: 'center' },
  emptySub: { fontSize: 14, color: theme.colors.textLight, marginTop: 8, textAlign: 'center' },

  noImageText: {
    color: theme.colors.textLight,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  photoBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
  },
  noImageContainer: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: 160,
    backgroundColor: '#EEE',
  },
});