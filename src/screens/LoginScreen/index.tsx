import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { UserRepository } from '../../repositories/UserRepository';
import { theme } from '../../constants/theme';
import { styles } from './styles';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Aviso', 'Preencha o e-mail e a senha.');
      return;
    }

     
    const userId = UserRepository.authenticate(email, password);

    if (userId) {
      login(userId);
      navigation.navigate('MainTabs'); 
    } else {
      Alert.alert('Erro', 'E-mail ou senha incorretos.');
    }
  };

  return (
    <View style={styles.container}>
      
      { }
      <Image 
        source={require('../../../assets/logo-branco.png')}
        style={styles.logo} 
        contentFit="contain" 
        transition={300}
      />

      <Text style={styles.title}>Bem-vindo de volta!</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="E-mail" 
        placeholderTextColor={theme.colors.textLight}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      
      <View style={styles.passwordContainer}>
        <TextInput 
          style={styles.passwordInput} 
          placeholder="Senha" 
          placeholderTextColor={theme.colors.textLight}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={theme.colors.textLight} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Não tem uma conta? <Text style={styles.linkBold}>Crie uma agora.</Text></Text>
      </TouchableOpacity>
    </View>
  );
}