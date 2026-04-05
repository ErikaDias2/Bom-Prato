import { StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  loggedOutContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  loggedOutTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12, textAlign: 'center' },
  loggedOutSubtitle: { fontSize: 16, color: theme.colors.textLight, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  loggedOutButton: { backgroundColor: theme.colors.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 25, width: '100%', alignItems: 'center', marginBottom: 16 },
  loggedOutButtonText: { color: theme.colors.card, fontSize: 16, fontWeight: 'bold' },
  loggedOutOutlineButton: { borderColor: theme.colors.primary, borderWidth: 2, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 25, width: '100%', alignItems: 'center' },
  loggedOutOutlineButtonText: { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold' },
  
  container: { flex: 1, backgroundColor: theme.colors.card },
  header: { alignItems: 'center', paddingVertical: 32, backgroundColor: theme.colors.primaryLight, borderBottomWidth: 1, borderColor: theme.colors.border, marginBottom: 20 },
  userName: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginTop: 8 },
  userEmail: { fontSize: 16, color: theme.colors.textLight, marginTop: 4 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  
   
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 24, marginBottom: 24 },
  
  actionsContainer: { paddingHorizontal: 24, marginTop: 20 },
  button: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: theme.colors.card, fontSize: 16, fontWeight: 'bold' },
  outlineButton: { borderColor: theme.colors.primary, borderWidth: 2, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  outlineButtonText: { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold' },
  
  menuButton: { borderColor: theme.colors.secondary, borderWidth: 2, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16, flexDirection: 'row', justifyContent: 'center' },
  menuButtonText: { color: theme.colors.secondary, fontSize: 16, fontWeight: 'bold' },
  
  logoutButton: { flexDirection: 'row', backgroundColor: 'rgba(255, 59, 48, 0.1)', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  logoutText: { color: theme.colors.danger, fontSize: 16, fontWeight: 'bold' }
});