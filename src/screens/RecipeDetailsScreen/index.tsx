import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Switch, Alert, Modal, TextInput, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { RecipeRepository } from '../../repositories/RecipeRepository';
import ConverterModal from '../../components/ConverterModal';
import { theme } from '../../constants/theme';
import { styles } from './styles';

export default function RecipeDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params; 
  
  const { isLoggedIn, userId } = useAuthStore();
  const [recipe, setRecipe] = useState<any>(null);
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [chefMode, setChefMode] = useState(false); 
  const [portions, setPortions] = useState(1);
  const [showConverter, setShowConverter] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [ingredientPrices, setIngredientPrices] = useState<Record<string, string>>({});
  const [reviews, setReviews] = useState<any[]>([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');

  const loadData = () => {
    const data = RecipeRepository.getRecipeById(id);
    if (data) {
      setRecipe(data);
      setPortions(data.base_portions);
    }
    
    if (isLoggedIn && userId) {
      setIsFavorite(RecipeRepository.isFavorite(userId, id));
    }
    const recipeReviews = RecipeRepository.getReviews(id);
    setReviews(recipeReviews);
  };

  useEffect(() => {
    loadData();
  }, [id, isLoggedIn, userId]);

  const handleToggleFavorite = () => {
    if (!isLoggedIn || !userId) return Alert.alert('Ops!', 'Você precisa estar logado para favoritar receitas.');
    const newStatus = RecipeRepository.toggleFavorite(userId, id, isFavorite);
    setIsFavorite(newStatus);
  };

  const shareRecipe = async () => {
    try {
      const message = `🥘 Olha essa receita maravilhosa de *${recipe.title}* que eu achei no app BOM PRATO!\n\n⏱️ Tempo: ${recipe.time_minutes} min\n🔥 Dificuldade: ${recipe.difficulty}\n\nBaixe o app Bom Prato para ver o passo a passo completo e usar o cronômetro guiado!`;
      await Share.share({ message, url: recipe.image_url, title: `Receita: ${recipe.title}` });
    } catch (error) { console.error(error); }
  };

  const handleSubmitReview = () => {
    if (!isLoggedIn || !userId) {
      return Alert.alert('Ops!', 'Faça login para avaliar receitas.');
    }
    if (myRating === 0) {
      return Alert.alert('Aviso', 'Por favor, selecione pelo menos uma estrela!');
    }
    
    RecipeRepository.addReview(id, userId, myRating, myComment.trim());
    setMyRating(0);
    setMyComment('');
    loadData(); 
    Alert.alert('Sucesso!', 'Sua avaliação foi publicada.');
  };

  const showChefModeHelp = () => Alert.alert("Modo Chef", "Oculta as medidas exatas para você cozinhar 'no olho'!");

  const formatAmount = (amount: number, currentMultiplier: number) => {
    const calculated = amount * currentMultiplier;
    if (calculated > 20) return Math.round(calculated).toString(); 
    const roundedToHalf = Math.round(calculated * 2) / 2;
    return roundedToHalf.toFixed(1).replace('.0', '');
  };

  const formatDateStr = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  if (!recipe) return <View style={styles.center}><Text>Carregando...</Text></View>;

  const multiplier = portions / recipe.base_portions;
  const totalCost = recipe?.ingredients?.reduce((sum: number, ing: any) => {
    const price = parseFloat(ingredientPrices[ing.name]?.replace(',', '.') || '0');
    return sum + (isNaN(price) ? 0 : price);
  }, 0) || 0;
  const costPerPortion = portions > 0 ? (totalCost / portions) : 0;

  return (
    <View style={styles.flex1}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: recipe.image_url }} style={styles.image} transition={300} />
        
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{recipe.title}</Text>
            <View style={styles.actionIcons}>
              <TouchableOpacity onPress={shareRecipe} style={styles.iconButton}>
                <Ionicons name="share-social-outline" size={26} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleToggleFavorite} style={styles.iconButton}>
                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={28} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.metaInfo}>⏱️ {recipe.time_minutes} min   |   🔥 {recipe.difficulty}</Text>

          {!chefMode && (
            <View style={styles.portionsContainer}>
              <Text style={styles.portionsLabel}>Rendimento (Porções):</Text>
              <View style={styles.portionsControls}>
                <TouchableOpacity onPress={() => setPortions(Math.max(1, portions - 1))} style={styles.portionButton}><Ionicons name="remove" size={20} color={theme.colors.primary} /></TouchableOpacity>
                <Text style={styles.portionsNumber}>{portions}</Text>
                <TouchableOpacity onPress={() => setPortions(portions + 1)} style={styles.portionButton}><Ionicons name="add" size={20} color={theme.colors.primary} /></TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Ingredientes</Text>
            <View style={styles.chefModeContainer}>
              <Text style={styles.chefModeText}>Modo Chef</Text>
              <TouchableOpacity onPress={showChefModeHelp} style={styles.helpIcon}><Ionicons name="help-circle-outline" size={20} color={theme.colors.textLight} /></TouchableOpacity>
              <Switch value={chefMode} onValueChange={setChefMode} trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }} thumbColor={chefMode ? theme.colors.primary : '#f4f3f4'} />
            </View>
          </View>

          {!chefMode && (
             <TouchableOpacity onPress={() => setShowConverter(true)} style={styles.converterButton}>
                <Ionicons name="calculator-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.converterText}>Conversor de Medidas</Text>
             </TouchableOpacity>
          )}

          <View style={styles.cardInfo}>
            {recipe.ingredients.map((item: any, index: number) => {
              if (chefMode) return <Text key={index} style={styles.listItem}>• {item.name}</Text>;
              const formattedAmount = formatAmount(item.amount, multiplier);
              return (
                <Text key={index} style={styles.listItem}>
                  • <Text style={styles.boldText}>{formattedAmount} {item.unit}</Text> de {item.name}
                </Text>
              );
            })}
          </View>

          {!chefMode && (
            <TouchableOpacity style={styles.calculatorBtn} onPress={() => setShowCostModal(true)}>
              <Ionicons name="cash-outline" size={20} color="#FFF" />
              <Text style={styles.calculatorBtnText}>Calcular Custo desta Receita</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.sectionTitle, styles.spacedTitle]}>Modo de Preparo</Text>
          <View style={styles.cardInfo}>
            {recipe.instructions.map((step: any, index: number) => (
              <Text key={index} style={styles.instructionsText}>
                <Text style={styles.stepNumber}>{index + 1}.</Text> {step.text}
              </Text>
            ))}
          </View>

          <TouchableOpacity style={styles.startPrepButton} onPress={() => navigation.navigate('GuidedPrep', { instructions: recipe.instructions, recipeId: recipe.id })}>
            <Ionicons name="play-circle" size={28} color={theme.colors.card} />
            <Text style={styles.startPrepButtonText}>Iniciar Preparo Guiado</Text>
          </TouchableOpacity>
          <View style={styles.reviewsSection}>
            <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Avaliações ({reviews.length})</Text>
            {isLoggedIn && userId && (
              <View style={styles.addReviewCard}>
                <Text style={styles.addReviewTitle}>O que achou da receita?</Text>
                
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setMyRating(star)}>
                      <Ionicons 
                        name={myRating >= star ? "star" : "star-outline"} 
                        size={36} 
                        color={myRating >= star ? "#FFC107" : theme.colors.textLight} 
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.reviewInput}
                  placeholder="Deixe um comentário (opcional)..."
                  multiline
                  numberOfLines={3}
                  value={myComment}
                  onChangeText={setMyComment}
                />
                
                <TouchableOpacity style={styles.submitReviewBtn} onPress={handleSubmitReview}>
                  <Text style={styles.submitReviewBtnText}>Publicar Avaliação</Text>
                </TouchableOpacity>
              </View>
            )}
            {reviews.length > 0 ? (
              reviews.map((rev: any) => (
                <View key={rev.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{rev.user_name}</Text>
                    <Text style={styles.reviewDate}>{formatDateStr(rev.created_at)}</Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Ionicons key={star} name="star" size={14} color={rev.rating >= star ? "#FFC107" : "#E0E0E0"} />
                    ))}
                  </View>
                  {rev.comment ? (
                    <Text style={styles.reviewText}>{rev.comment}</Text>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={styles.emptyReviews}>Nenhuma avaliação ainda. Seja o primeiro!</Text>
            )}
          </View>
          
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <ConverterModal visible={showConverter} onClose={() => setShowConverter(false)} />

      <Modal visible={showCostModal} transparent animationType="slide">
        <View style={styles.costModalOverlay}>
          <View style={styles.costModalContent}>
            <View style={styles.costModalHeader}>
              <Text style={styles.costModalTitle}>Calculadora de Custo</Text>
              <TouchableOpacity onPress={() => {
                setShowCostModal(false);
                setIngredientPrices({});
              }}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.costSubtitle}>Insira o valor estimado gasto com os ingredientes:</Text>

            <FlatList
              data={recipe?.ingredients}
              keyExtractor={(item) => item.name}
              showsVerticalScrollIndicator={false}
              style={styles.costList}
              renderItem={({ item }) => (
                <View style={styles.costInputRow}>
                  <Text style={styles.costIngName}>
                    {formatAmount(item.amount, multiplier)} {item.unit} de {item.name}
                  </Text>
                  <View style={styles.costInputContainer}>
                    <Text style={styles.costCurrency}>R$</Text>
                    <TextInput
                      style={styles.costInput}
                      keyboardType="numeric"
                      placeholder="0.00"
                      value={ingredientPrices[item.name] || ''}
                      onChangeText={(text) => setIngredientPrices(prev => ({ ...prev, [item.name]: text }))}
                    />
                  </View>
                </View>
              )}
            />

            <View style={styles.costResultBox}>
              <View style={styles.costResultRow}>
                <Text style={styles.costResultLabel}>Custo Total:</Text>
                <Text style={styles.costResultValue}>R$ {totalCost.toFixed(2).replace('.', ',')}</Text>
              </View>
              <View style={styles.costResultRow}>
                <Text style={styles.costResultLabel}>Por Porção ({portions}):</Text>
                <Text style={styles.costResultPortion}>R$ {costPerPortion.toFixed(2).replace('.', ',')}</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}