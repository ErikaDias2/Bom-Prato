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
  calculatorBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 10, marginHorizontal: 20, marginTop: 10 },
  calculatorBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  costModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  costModalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  costModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  costModalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  costSubtitle: { fontSize: 14, color: theme.colors.textLight, marginBottom: 16 },
  costList: { maxHeight: 300 },
  costInputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  costIngName: { flex: 1, fontSize: 14, color: theme.colors.text },
  costInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 12, height: 40, width: 100 },
  costCurrency: { color: theme.colors.textLight, marginRight: 4, fontWeight: 'bold' },
  costInput: { flex: 1, color: theme.colors.text, fontWeight: 'bold' },
  costResultBox: { backgroundColor: '#FFF5F0', padding: 16, borderRadius: 12, marginTop: 16 },
  costResultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  costResultLabel: { fontSize: 16, color: theme.colors.text, fontWeight: '600' },
  costResultValue: { fontSize: 20, color: theme.colors.primary, fontWeight: 'bold' },
  costResultPortion: { fontSize: 16, color: theme.colors.primary, fontWeight: 'bold' },
  reviewsSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 24,
  },
  addReviewCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  addReviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  reviewInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
    color: theme.colors.text,
    marginBottom: 12,
  },
  submitReviewBtn: {
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitReviewBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewCard: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewAuthor: {
    fontWeight: 'bold',
    color: theme.colors.text,
    fontSize: 14,
  },
  reviewDate: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  reviewStars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyReviews: {
    textAlign: 'center',
    color: theme.colors.textLight,
    fontStyle: 'italic',
    marginTop: 10,
  },
});