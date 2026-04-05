import { StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, backgroundColor: theme.colors.card },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary, marginTop: 24, marginBottom: 12 },
  
  input: { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md, padding: 16, fontSize: 16, marginBottom: 16, color: theme.colors.text },
  
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md, marginBottom: 16 },
  passwordInput: { flex: 1, padding: 16, fontSize: 16, color: theme.colors.text },
  eyeIcon: { padding: 16 },
  
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  
  button: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 40, marginBottom: 20 },
  buttonText: { color: theme.colors.card, fontSize: 18, fontWeight: 'bold' }
});