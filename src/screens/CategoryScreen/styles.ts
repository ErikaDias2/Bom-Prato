import { StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  listContainer: { padding: theme.spacing.sm },
  card: { flex: 1, margin: theme.spacing.sm, borderRadius: theme.borderRadius.md, overflow: 'hidden', elevation: 3, height: 120 },
  image: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: theme.colors.card, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }
});