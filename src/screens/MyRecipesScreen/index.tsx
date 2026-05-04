import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { RecipeRepository } from '../../repositories/RecipeRepository';
import RecipeCard from '../../components/RecipeCard';
import { theme } from '../../constants/theme';

export default function MyRecipesScreen() {
  const navigation = useNavigation<any>();
  const { isLoggedIn, userId } = useAuthStore();
  const [myRecipes, setMyRecipes] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn && userId) {
        setMyRecipes(RecipeRepository.getUserCreatedRecipes(userId));
      }
    }, [isLoggedIn, userId])
  );

  if (!isLoggedIn) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="restaurant" size={80} color={theme.colors.textLight} />
        <Text style={styles.title}>Crie seu Cardápio</Text>
        <Text style={styles.subtitle}>Faça login para cadastrar e gerenciar suas próprias receitas.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Fazer Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {myRecipes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="book-outline" size={80} color={theme.colors.textLight} />
          <Text style={styles.title}>Caderno Vazio</Text>
          <Text style={styles.subtitle}>Você ainda não cadastrou nenhuma receita própria.</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CreateRecipe')}>
            <Text style={styles.buttonText}>Criar Minha Primeira Receita</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={myRecipes}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <RecipeCard 
              title={item.title} 
              time={`${item.time_minutes} min`}
              rating={item.rating}
              imageUrl={item.image_url}
              onPress={() => navigation.navigate('RecipeDetails', { id: item.id })} 
            />
          )}
        />
      )}
      {myRecipes.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateRecipe')}>
          <Ionicons name="add" size={32} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  list: { padding: 20, paddingBottom: 80 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text, marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 16, color: theme.colors.textLight, textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: theme.colors.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: theme.colors.primary, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }
});