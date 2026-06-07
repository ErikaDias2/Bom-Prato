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
  logoutText: { color: theme.colors.danger, fontSize: 16, fontWeight: 'bold' },
  helperText: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: 10,
    fontStyle: 'italic'
  },
  customCatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 8,
    marginRight: 8
  },
  customCatText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 13
  },
  addCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed'
  },
  addCatBtnText: {
    color: theme.colors.textLight,
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    elevation: 5
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 16
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 20
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: theme.colors.textLight,
    fontWeight: 'bold',
    fontSize: 16
  },
  modalSaveBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  modalSaveText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  }
});