import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useAuthStore } from '../../store/authStore';
import { RecipeRepository } from '../../repositories/RecipeRepository';
import { theme } from '../../constants/theme';

const COMMON_UNITS = ['xícara', 'colher de sopa', 'colher de chá', 'g', 'kg', 'ml', 'litro', 'unidade', 'pitada', 'dente', 'fatia', 'a gosto'];

export default function CreateRecipeScreen() {
  const navigation = useNavigation<any>();
  const { userId } = useAuthStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Almoço');
  const [time, setTime] = useState('');
  const [difficulty, setDifficulty] = useState('Fácil');
  const [portions, setPortions] = useState('');
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: '' }]);
  const [instructions, setInstructions] = useState([{ text: '', timer_minutes: '' }]);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [activeIngIndex, setActiveIngIndex] = useState<number | null>(null);
  const [customUnitText, setCustomUnitText] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos.');

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const updateIngredient = (text: string, index: number, field: string) => {
    const newIng = [...ingredients];
    (newIng[index] as any)[field] = text;
    setIngredients(newIng);
  };

  const updateInstruction = (text: string, index: number, field: 'text' | 'timer_minutes') => {
    const newInst = [...instructions];
    newInst[index][field] = text;
    setInstructions(newInst);
  };

  const openUnitModal = (index: number) => {
    setActiveIngIndex(index);
    setCustomUnitText(ingredients[index].unit);
    setUnitModalVisible(true);
  };

  const confirmUnit = (unitToSave: string) => {
    if (activeIngIndex !== null) {
      updateIngredient(unitToSave, activeIngIndex, 'unit');
    }
    setUnitModalVisible(false);
    setCustomUnitText('');
  };

  const handleSave = async () => {
    if (!title || !time || !portions || !imageUri) return Alert.alert('Erro', 'Preencha todos os campos básicos e a foto!');
    if (ingredients.some(i => !i.name || !i.amount)) return Alert.alert('Erro', 'Preencha a quantidade e nome de todos os ingredientes!');
    if (instructions.some(i => !i.text)) return Alert.alert('Erro', 'Preencha o texto de todos os passos de preparo!');

    setIsSaving(true);

    try {
      const fileName = `recipe_${Date.now()}.jpg`;
      const permanentDirectory = FileSystem.documentDirectory + 'user_recipes/';
      const permanentUri = permanentDirectory + fileName;

      const dirInfo = await FileSystem.getInfoAsync(permanentDirectory);
      if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(permanentDirectory, { intermediates: true });

      await FileSystem.copyAsync({ from: imageUri, to: permanentUri });

      const parsedIngredients = ingredients.map(i => ({ ...i, amount: parseFloat(i.amount.replace(',', '.')) }));
      const parsedInstructions = instructions.map(i => ({
        text: i.text,
        timer_seconds: i.timer_minutes ? parseInt(i.timer_minutes) * 60 : null
      }));

      RecipeRepository.createRecipe(userId!, {
        title, category, difficulty, image_url: permanentUri,
        time_minutes: parseInt(time), base_portions: parseInt(portions),
        ingredients: parsedIngredients, instructions: parsedInstructions
      });

      Alert.alert('Sucesso!', 'Receita cadastrada com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar a receita.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>Foto da Receita</Text>
        <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} contentFit="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={48} color={theme.colors.textLight} />
              <Text style={styles.imagePlaceholderText}>Toque para selecionar uma foto</Text>
            </View>
          )}
          {imageUri && <View style={styles.editBadge}><Ionicons name="create" size={16} color="#FFF" /></View>}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Informações Básicas</Text>
        <TextInput style={styles.input} placeholder="Nome da Receita (ex: Bolo de Cenoura)" value={title} onChangeText={setTitle} />
        
        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.chipsRow}>
              {['Almoço', 'Jantar', 'Sobremesa', 'Fitness'].map(cat => (
                <TouchableOpacity key={cat} style={[styles.chip, category === cat && styles.chipActive]} onPress={() => setCategory(cat)}>
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Dificuldade</Text>
            <View style={styles.chipsRow}>
              {['Fácil', 'Média', 'Difícil'].map(diff => (
                <TouchableOpacity key={diff} style={[styles.chip, difficulty === diff && styles.chipActive]} onPress={() => setDifficulty(diff)}>
                  <Text style={[styles.chipText, difficulty === diff && styles.chipTextActive]}>{diff}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <TextInput style={[styles.input, styles.halfInput]} placeholder="Tempo (min)" keyboardType="numeric" value={time} onChangeText={setTime} />
          <TextInput style={[styles.input, styles.halfInput]} placeholder="Rendimento (Porções)" keyboardType="numeric" value={portions} onChangeText={setPortions} />
        </View>

        <Text style={styles.sectionTitle}>Ingredientes</Text>
        {ingredients.map((ing, index) => (
          <View key={`ing_${index}`} style={styles.ingRow}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Qtd" keyboardType="numeric" value={ing.amount} onChangeText={(t) => updateIngredient(t, index, 'amount')} />
            <TouchableOpacity style={[styles.input, styles.unitSelect]} onPress={() => openUnitModal(index)}>
              <Text style={{ color: ing.unit ? theme.colors.text : theme.colors.textLight }} numberOfLines={1}>
                {ing.unit || 'Unidade'}
              </Text>
              <Ionicons name="caret-down" size={14} color={theme.colors.textLight} />
            </TouchableOpacity>

            <TextInput style={[styles.input, { flex: 2 }]} placeholder="Ingrediente (ex: Açúcar)" value={ing.name} onChangeText={(t) => updateIngredient(t, index, 'name')} />
            {ingredients.length > 1 && (
              <TouchableOpacity onPress={() => setIngredients(ingredients.filter((_, i) => i !== index))} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color="#FF5252" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={() => setIngredients([...ingredients, { name: '', amount: '', unit: '' }])}>
          <Text style={styles.addBtnText}>+ Adicionar Ingrediente</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Modo de Preparo</Text>
        {instructions.map((inst, index) => (
          <View key={`inst_${index}`} style={styles.instRow}>
            <Text style={styles.stepNum}>{index + 1}.</Text>
            <View style={{ flex: 1 }}>
              <TextInput style={styles.input} placeholder="Descreva o passo..." multiline value={inst.text} onChangeText={(t) => updateInstruction(t, index, 'text')} />
              <View style={styles.timerInputContainer}>
                <Ionicons name="timer-outline" size={18} color={theme.colors.primary} />
                <TextInput 
                  style={styles.timerInput} 
                  placeholder="Tempo do passo em minutos (Opcional)" 
                  keyboardType="numeric" 
                  value={inst.timer_minutes} 
                  onChangeText={(t) => updateInstruction(t, index, 'timer_minutes')} 
                />
              </View>
            </View>

            {instructions.length > 1 && (
              <TouchableOpacity onPress={() => setInstructions(instructions.filter((_, i) => i !== index))} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color="#FF5252" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={() => setInstructions([...instructions, { text: '', timer_minutes: '' }])}>
          <Text style={styles.addBtnText}>+ Adicionar Passo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]} onPress={handleSave} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Salvar Minha Receita</Text>}
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={unitModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Unidade de Medida</Text>
              <TouchableOpacity onPress={() => setUnitModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.customUnitContainer}>
              <TextInput 
                style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                placeholder="Digitar unidade diferente..." 
                value={customUnitText} 
                onChangeText={setCustomUnitText} 
              />
              <TouchableOpacity style={styles.confirmUnitBtn} onPress={() => confirmUnit(customUnitText)}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>OK</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Ou escolha uma padrão:</Text>
            <View style={styles.chipsRow}>
              {COMMON_UNITS.map(unit => (
                <TouchableOpacity key={unit} style={styles.chip} onPress={() => confirmUnit(unit)}>
                  <Text style={styles.chipText}>{unit}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginTop: 20, marginBottom: 12 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, marginBottom: 12, color: theme.colors.text, fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  halfInput: { width: '48%' },
  halfCol: { flex: 1 },
  label: { fontSize: 14, color: theme.colors.textLight, marginBottom: 8, fontWeight: '600' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#EEEEEE', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginBottom: 4 },
  chipActive: { backgroundColor: theme.colors.primary },
  chipText: { fontSize: 13, color: theme.colors.textLight, fontWeight: 'bold' },
  chipTextActive: { color: '#FFF' },
  ingRow: { flexDirection: 'row', alignItems: 'center' },
  unitSelect: { flex: 1.2, marginHorizontal: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  instRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  stepNum: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary, marginRight: 8, marginTop: 12 },
  timerInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F0', borderRadius: 8, paddingHorizontal: 10, height: 40, marginBottom: 12, borderWidth: 1, borderColor: '#FFE4D6' },
  timerInput: { flex: 1, marginLeft: 8, fontSize: 13, color: theme.colors.primary },

  deleteBtn: { padding: 8, marginLeft: 4, marginTop: 4 },
  addBtn: { marginBottom: 10, paddingVertical: 8 },
  addBtnText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 14 },
  saveBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 40, height: 55, justifyContent: 'center' },
  saveBtnDisabled: { backgroundColor: theme.colors.textLight },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  imagePickerContainer: { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#F0F0F0', overflow: 'hidden', borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  previewImage: { width: '100%', height: '100%' },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  imagePlaceholderText: { color: theme.colors.textLight, marginTop: 10, fontSize: 14, textAlign: 'center', fontWeight: '600' },
  editBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  customUnitContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  confirmUnitBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, height: 46, borderRadius: 8, justifyContent: 'center', marginLeft: 10 }
});