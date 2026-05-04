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
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString; 
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch {
      return isoString;
    }
  };

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
          keyExtractor={(item) => item.history_id ? item.history_id.toString() : item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('RecipeDetails', { id: item.recipe_id })}
            >
              {(item.user_photo_url && item.user_photo_url.trim() !== "") ? (
                <View style={styles.imageWrapper}>
                  <Image 
                    source={{ uri: item.user_photo_url.startsWith('file://') ? item.user_photo_url : `file://${item.user_photo_url}` }} 
                    style={styles.image} 
                    contentFit="cover" 
                  />
                  <View style={styles.photoBadge}>
                    <Ionicons name="camera" size={12} color="#FFF" />
                    <Text style={styles.photoBadgeText}>Sua Foto</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.imageWrapper}>
                  <Image 
                    source={{ uri: item.original_recipe_image }} 
                    style={styles.image} 
                    contentFit="cover" 
                  />
                </View>
              )}

              <View style={styles.infoContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>📅 Preparado em: {formatDate(item.cooked_date)}</Text>
                
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