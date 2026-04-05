import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

interface ChipProps {
  label: string | number;
  isActive: boolean;
  onPress: () => void;
  style?: any;  
}

export default function Chip({ label, isActive, onPress, style }: ChipProps) {
  return (
    <TouchableOpacity 
      style={[styles.chip, isActive && styles.chipActive, style]}  
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: theme.colors.border,  
    paddingVertical: 10,  
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',  
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.textLight,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',  
  },
  chipTextActive: {
    color: theme.colors.card,
  }
});