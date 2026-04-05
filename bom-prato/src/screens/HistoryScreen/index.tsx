import { useState, useCallback } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuthStore } from '../../store/authStore';
import { HistoryRepository } from '../../repositories/HistoryRepository';
import { theme } from '../../constants/theme';
import { styles } from './styles';

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const { userId } = useAuthStore();
  const [history, setHistory] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        setHistory(HistoryRepository.getUserHistory(userId));
      }
    }, [userId])
  );

  return (
    <View style={styles.container}>
      {history.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="book-outline" size={80} color={theme.colors.border} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>Seu diário está vazio.</Text>
          <Text style={styles.emptySub}>Comece a cozinhar no Modo Guiado para registrar suas aventuras!</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.history_id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('RecipeDetails', { id: item.recipe_id })}
            >
              <Image source={{ uri: item.image_url }} style={styles.image} contentFit="cover" />
              <View style={styles.infoContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>📅 Preparado em: {item.cooked_date}</Text>
                {item.notes ? (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteText}>"{item.notes}"</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}