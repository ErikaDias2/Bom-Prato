import { StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  image: { width: '100%', height: 280 },
  content: { padding: theme.spacing.lg, marginTop: -20, backgroundColor: theme.colors.background, borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl },
  
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { flex: 1, fontSize: 28, fontWeight: 'bold', color: theme.colors.primary, marginRight: 10 },
  actionIcons: { flexDirection: 'row', gap: 12, marginTop: 4 },
  iconButton: { padding: 4 },
  metaInfo: { fontSize: 15, color: theme.colors.textLight, marginBottom: 24, fontWeight: 'bold' },
  
  portionsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.card, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  portionsLabel: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  portionsControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  portionButton: { backgroundColor: theme.colors.primaryLight, padding: theme.spacing.sm, borderRadius: theme.borderRadius.sm },
  portionsNumber: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary },

   
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 0, marginBottom: 12 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text },
  spacedTitle: { marginTop: 32, marginBottom: 16 },
  
  chefModeContainer: { flexDirection: 'row', alignItems: 'center' },
  chefModeText: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textLight },
  helpIcon: { paddingHorizontal: 4 },
  
   
  converterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primaryLight, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'flex-start', gap: 6, marginBottom: 24 },
  converterText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 14 },

  cardInfo: { backgroundColor: theme.colors.card, padding: 20, borderRadius: theme.borderRadius.md, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  listItem: { fontSize: 16, lineHeight: 30, color: theme.colors.text, marginBottom: 6 },
  boldText: { fontWeight: 'bold', color: theme.colors.primary },
  instructionsText: { fontSize: 16, lineHeight: 30, color: theme.colors.text, marginBottom: 16 },
  stepNumber: { fontWeight: 'bold', color: theme.colors.primary },
  
   
  startPrepButton: { flexDirection: 'row', backgroundColor: theme.colors.primary, padding: 18, borderRadius: theme.borderRadius.md, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 32, marginBottom: 40, elevation: 4 },
  startPrepButtonText: { color: theme.colors.card, fontSize: 18, fontWeight: 'bold' },
});