import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { RecipeRepository } from '../../repositories/RecipeRepository';
import { theme } from '../../constants/theme';

export default function SavedRecipesScreen() {
  const navigation = useNavigation<any>();
  const { userId } = useAuthStore();
  const [recipes, setRecipes] = useState<any[]>([]);

  const loadOfflineRecipes = useCallback(() => {
    if (userId) {
      const data = RecipeRepository.getOfflineRecipes(userId);
      setRecipes(data);
    }
  }, [userId]);

  useFocusEffect(loadOfflineRecipes);

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Nenhuma receita salva para ver off-line.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('RecipeDetails', { id: item.id })}
          >
            <Image source={{ uri: item.image_url }} style={styles.image} />
            <View style={styles.cardContent}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.meta}>⏱️ {item.time_minutes} min | 🔥 {item.difficulty}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { alignItems: 'center', justifyContent: 'center', marginTop: 80, padding: 24 },
  emptyText: { marginTop: 12, fontSize: 16, color: '#999', textAlign: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#EAEAEA' },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  cardContent: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  meta: { fontSize: 13, color: '#666', marginTop: 4 }
});