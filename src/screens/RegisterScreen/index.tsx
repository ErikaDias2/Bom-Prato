import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Chip from '../../components/Chip';
import { UserRepository } from '../../repositories/UserRepository';
import { theme } from '../../constants/theme';
import { styles } from './styles';

export default function RegisterScreen() {
  const navigation = useNavigation();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [preferences, setPreferences] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);
  
  const [selectedPrefs, setSelectedPrefs] = useState<number[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<number[]>([]);

  useEffect(() => {
    setPreferences(UserRepository.getPreferences());
    setAllergies(UserRepository.getAllergies());
  }, []);

  const toggleSelection = (id: number, state: number[], setState: any) => {
    if (state.includes(id)) {
      setState(state.filter((item: number) => item !== id)); 
    } else {
      setState([...state, id]); 
    }
  };

  const handleRegister = () => {
    if (!name || !email || !password) return Alert.alert('Erro', 'Preencha os campos básicos.');
    if (password !== confirmPassword) return Alert.alert('Erro', 'As senhas não coincidem!');

    try {
      UserRepository.registerUser(name, email, password, selectedPrefs, selectedAllergies);
      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login.');
      navigation.goBack(); 
    } catch (error) {
      Alert.alert('Erro', 'Este e-mail já está cadastrado ou ocorreu um erro.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
      
      <Text style={styles.sectionTitle}>Informações Básicas</Text>
      <TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor={theme.colors.textLight} value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor={theme.colors.textLight} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      
      <View style={styles.passwordContainer}>
        <TextInput style={styles.passwordInput} placeholder="Senha" placeholderTextColor={theme.colors.textLight} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={theme.colors.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput style={styles.passwordInput} placeholder="Confirmar Senha" placeholderTextColor={theme.colors.textLight} secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
          <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color={theme.colors.textLight} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Preferências Alimentares</Text>
      <View style={styles.chipsContainer}>
        <Chip 
          label="Nenhuma" 
          isActive={selectedPrefs.length === 0} 
          onPress={() => setSelectedPrefs([])} 
        />
        {preferences.map((p) => (
          <Chip 
            key={p.id} 
            label={p.name} 
            isActive={selectedPrefs.includes(p.id)} 
            onPress={() => toggleSelection(p.id, selectedPrefs, setSelectedPrefs)} 
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Restrições e Alergias</Text>
      <View style={styles.chipsContainer}>
        <Chip 
          label="Nenhuma" 
          isActive={selectedAllergies.length === 0} 
          onPress={() => setSelectedAllergies([])} 
        />
        {allergies.map((a) => (
          <Chip 
            key={a.id} 
            label={a.name} 
            isActive={selectedAllergies.includes(a.id)} 
            onPress={() => toggleSelection(a.id, selectedAllergies, setSelectedAllergies)} 
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Criar minha conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}