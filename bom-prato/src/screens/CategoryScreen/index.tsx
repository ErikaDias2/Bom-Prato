import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { RecipeRepository } from '../../repositories/RecipeRepository';
import { styles } from './styles';

export default function CategoryScreen() {
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    setCategories(RecipeRepository.getCategories());
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CategoryRecipes', { categoryName: item.category })}
          >
            <Image source={{ uri: item.image_url }} style={styles.image} contentFit="cover" />
            <View style={styles.overlay}>
              <Text style={styles.title}>{item.category}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}