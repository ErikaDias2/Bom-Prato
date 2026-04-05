import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Switch, Alert } from 'react-native';
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

  useEffect(() => {
     
    const data = RecipeRepository.getRecipeById(id);
    if (data) {
      setRecipe(data);
      setPortions(data.base_portions);
    }
    
    if (isLoggedIn && userId) {
      setIsFavorite(RecipeRepository.isFavorite(userId, id));
    }
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

  const showChefModeHelp = () => Alert.alert("Modo Chef", "Oculta as medidas exatas para você cozinhar 'no olho'!");

  if (!recipe) return <View style={styles.center}><Text>Carregando...</Text></View>;

  const multiplier = portions / recipe.base_portions;

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
              const calculatedAmount = (item.amount * multiplier).toFixed(1).replace('.0', '');
              return (
                <Text key={index} style={styles.listItem}>
                  • <Text style={styles.boldText}>{calculatedAmount} {item.unit}</Text> de {item.name}
                </Text>
              );
            })}
          </View>

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

        </View>
      </ScrollView>

      { }
      <ConverterModal visible={showConverter} onClose={() => setShowConverter(false)} />
    </View>
  );
}