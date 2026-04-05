import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface RecipeCardProps {
  title: string;
  time: string;
  imageUrl: string;
  rating?: number;
  onPress: () => void;
}

export default function RecipeCard({ title, time, imageUrl, rating, onPress }: RecipeCardProps) {
  const renderStars = (currentRating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= currentRating) {
        stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
      } else if (i - 0.5 <= currentRating) {
        stars.push(<Ionicons key={i} name="star-half" size={16} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={16} color="#FFD700" />);
      }
    }
    return stars;
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.image} 
        contentFit="cover" 
        transition={200}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        <View style={styles.metaContainer}>
          {rating && (
            <View style={styles.ratingRow}>
              <View style={styles.starsContainer}>
                {renderStars(rating)}
              </View>
              <Text style={styles.ratingNumber}>{rating.toFixed(1)}</Text>
            </View>
          )}
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={18} />
            <Text style={styles.timeText}>{time}</Text>
          </View>
          
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: 160,
  },
  info: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  metaContainer: {
    flexDirection: 'column',
    gap: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textLight,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: theme.colors.textLight,
    fontWeight: 'bold',
  }
});