import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import Chip from './Chip';

interface ConverterModalProps {
  visible: boolean;
  onClose: () => void;
}

const DENSITIES: Record<string, number> = {
  'Farinha': 120,
  'Açúcar': 200,
  'Manteiga': 200,
  'Cacau': 90,
  'Líquidos': 240, 
};

export default function ConverterModal({ visible, onClose }: ConverterModalProps) {
  const [ingredient, setIngredient] = useState('Farinha');
  const [convertValue, setConvertValue] = useState('1');
  const [convertFrom, setConvertFrom] = useState('Xícara');
  const [convertTo, setConvertTo] = useState('Gramas / ml');

   
  const handleIncrement = () => {
    const val = parseFloat(convertValue.replace(',', '.')) || 0;
    setConvertValue(String(val + 1));
  };

  const handleDecrement = () => {
    const val = parseFloat(convertValue.replace(',', '.')) || 0;
    if (val > 0) {
      setConvertValue(String(Math.max(0, val - 1)));
    }
  };

  const getConversionResult = () => {
    const val = parseFloat(convertValue.replace(',', '.')) || 0;
    if (convertFrom === convertTo) return `${val} ${convertTo}`;

    let cups = 0;
    if (convertFrom === 'Xícara') cups = val;
    else if (convertFrom === 'Colher (Sopa)') cups = val / 16;
    else if (convertFrom === 'Colher (Chá)') cups = val / 48;
    else if (convertFrom === 'Gramas / ml') cups = val / DENSITIES[ingredient];

    let result = 0;
    if (convertTo === 'Xícara') result = cups;
    else if (convertTo === 'Colher (Sopa)') result = cups * 16;
    else if (convertTo === 'Colher (Chá)') result = cups * 48;
    else if (convertTo === 'Gramas / ml') result = cups * DENSITIES[ingredient];

    return `${Number(result.toFixed(1))} ${convertTo}`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Conversor de Medidas</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={theme.colors.text} /></TouchableOpacity>
          </View>

          { }
          <Text style={styles.filterLabel}>Qual o Ingrediente?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollChips}>
            {Object.keys(DENSITIES).map(ing => (
              <Chip key={ing} label={ing} isActive={ingredient === ing} onPress={() => setIngredient(ing)} />
            ))}
          </ScrollView>

          <Text style={styles.filterLabel}>Quantidade</Text>
          <View style={styles.quantityContainer}>
            { }
            <TouchableOpacity style={styles.qtyButton} onPress={handleDecrement}>
              <Ionicons name="remove" size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              value={convertValue} 
              onChangeText={setConvertValue} 
            />

            { }
            <TouchableOpacity style={styles.qtyButton} onPress={handleIncrement}>
              <Ionicons name="add" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.filterLabel}>Converter de:</Text>
          <View style={styles.chipsGrid}>
            {['Xícara', 'Colher (Sopa)', 'Colher (Chá)', 'Gramas / ml'].map(unit => (
              <Chip key={unit} label={unit} isActive={convertFrom === unit} onPress={() => setConvertFrom(unit)} style={styles.gridChip} />
            ))}
          </View>

          <Text style={styles.filterLabel}>Para:</Text>
          <View style={styles.chipsGrid}>
            {['Xícara', 'Colher (Sopa)', 'Colher (Chá)', 'Gramas / ml'].map(unit => (
              <Chip key={unit} label={unit} isActive={convertTo === unit} onPress={() => setConvertTo(unit)} style={styles.gridChip} />
            ))}
          </View>

          { }
          <View style={styles.conversionResult}>
            { }
            <Text style={styles.resultText}>Resultado exato</Text>
            <Text style={styles.boldText}>{getConversionResult()}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.card, padding: theme.spacing.lg, borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary },
  
  filterLabel: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textLight, marginBottom: 8, marginTop: 12 },
  
  scrollChips: { gap: 10, paddingBottom: 8 },
  
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 4 },
  gridChip: { width: '48%', marginBottom: 10 }, 
  
   
  quantityContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  qtyButton: { backgroundColor: theme.colors.border, padding: 12, borderRadius: theme.borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, backgroundColor: theme.colors.background, padding: 12, borderRadius: theme.borderRadius.md, fontSize: 18, textAlign: 'center', fontWeight: 'bold', color: theme.colors.primary },
  
   
  conversionResult: { 
    backgroundColor: 'rgba(255, 106, 0, 0.1)',  
    padding: theme.spacing.md,
    marginTop: 16, 
    alignItems: 'center' 
  },
  resultText: { 
    fontSize: 14, 
    color: theme.colors.text, 
    textAlign: 'center',
    fontWeight: '600',  
    marginBottom: 4,
  },
  boldText: { fontWeight: 'bold', color: theme.colors.primary, fontSize: 24 }
});