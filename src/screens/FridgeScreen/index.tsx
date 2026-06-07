import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RecipeRepository } from '../../repositories/RecipeRepository';
import RecipeCard from '../../components/RecipeCard';
import { theme } from '../../constants/theme';

export default function FridgeScreen() {
  const navigation = useNavigation<any>();
  const [inputValue, setInputValue] = useState('');
  const [myIngredients, setMyIngredients] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (myIngredients.length > 0) {
      setResults(RecipeRepository.getRecipesByIngredients(myIngredients));
    } else {
      setResults([]);
    }
  }, [myIngredients]);

  const addIngredient = () => {
    if (inputValue.trim() !== '' && !myIngredients.includes(inputValue.trim())) {
      setMyIngredients([...myIngredients, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeIngredient = (ing: string) => {
    setMyIngredients(myIngredients.filter(item => item !== ing));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>O que tem na Geladeira?</Text>
        <Text style={styles.subtitle}>Digite os ingredientes que você tem em casa e nós sugerimos o prato!</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ex: Frango, Ovo, Batata..."
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={addIngredient}
        />
        <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.chipsContainer}>
        {myIngredients.map(ing => (
          <TouchableOpacity key={ing} style={styles.chip} onPress={() => removeIngredient(ing)}>
            <Text style={styles.chipText}>{ing}</Text>
            <Ionicons name="close-circle" size={16} color="#FFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.resultsContainer}>
        {myIngredients.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="basket-outline" size={60} color={theme.colors.border} />
            <Text style={styles.emptyStateText}>Sua cesta está vazia.</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="sad-outline" size={60} color={theme.colors.border} />
            <Text style={styles.emptyStateText}>Nenhuma receita usa esses ingredientes juntos.</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View>
                <Text style={styles.matchText}>Combina com {item.matchCount} ingrediente(s) seu(s)</Text>
                <RecipeCard 
                  title={item.title} 
                  time={`${item.time_minutes} min`} 
                  rating={item.rating} 
                  imageUrl={item.image_url} 
                  onPress={() => navigation.navigate('RecipeDetails', { id: item.id })} 
                />
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  title: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: theme.colors.textLight },
  inputContainer: { flexDirection: 'row', padding: 20, paddingBottom: 10 },
  input: { flex: 1, backgroundColor: '#F0F0F0', borderRadius: 8, paddingHorizontal: 16, height: 50, fontSize: 16 },
  addButton: { backgroundColor: theme.colors.primary, width: 50, height: 50, borderRadius: 8, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, marginBottom: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginEnd: 8, marginBottom: 8 },
  chipText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  resultsContainer: { flex: 1, paddingHorizontal: 20 },
  matchText: { color: theme.colors.secondary, fontWeight: 'bold', fontSize: 12, marginBottom: 8, marginTop: 10 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyStateText: { color: theme.colors.textLight, marginTop: 10, fontSize: 16 }
});