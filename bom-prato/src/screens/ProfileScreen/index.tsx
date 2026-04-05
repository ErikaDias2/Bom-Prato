import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Chip from '../../components/Chip';
import { useAuthStore } from '../../store/authStore';
import { UserRepository } from '../../repositories/UserRepository';
import { theme } from '../../constants/theme';
import { styles } from './styles';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { isLoggedIn, userId, logout } = useAuthStore();

  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedPrefs, setSelectedPrefs] = useState<number[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn && userId) {
        const userData = UserRepository.getUserById(userId);
        if (userData) {
          setUser(userData);
          setSelectedPrefs(JSON.parse(userData.preferences || '[]'));
          setSelectedAllergies(JSON.parse(userData.allergies || '[]'));
        }
        setPreferences(UserRepository.getPreferences());
        setAllergies(UserRepository.getAllergies());
      }
    }, [isLoggedIn, userId])
  );

  if (!isLoggedIn) {
    return (
      <View style={styles.loggedOutContainer}>
        <Ionicons name="lock-closed-outline" size={80} color={theme.colors.border} style={{ marginBottom: 20 }} />
        <Text style={styles.loggedOutTitle}>Cozinhe do seu jeito!</Text>
        <Text style={styles.loggedOutSubtitle}>Acesse sua conta para salvar suas receitas favoritas e receber sugestões personalizadas.</Text>
        <TouchableOpacity style={styles.loggedOutButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loggedOutButtonText}>Fazer Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.loggedOutOutlineButton} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.loggedOutOutlineButtonText}>Criar Conta Grátis</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleSelection = (id: number, state: number[], setState: any) => {
    if (!isEditing) return;
    if (state.includes(id)) setState(state.filter((item) => item !== id));
    else setState([...state, id]);
  };

  const handleSave = () => {
    try {
      if (userId) {
        UserRepository.updateProfile(userId, selectedPrefs, selectedAllergies);
      }
      setIsEditing(false);
      Alert.alert('Sucesso', 'Seu perfil foi atualizado!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      
      <View style={styles.header}>
        <Ionicons name="person-circle" size={100} color={theme.colors.primary} />
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Preferências Alimentares</Text>
      </View>
      <View style={styles.chipsContainer}>
        {(isEditing || selectedPrefs.length === 0) && (
          <Chip 
            label="Nenhuma" 
            isActive={selectedPrefs.length === 0} 
            onPress={() => isEditing && setSelectedPrefs([])} 
          />
        )}
        {preferences.map((p) => {
          const isSelected = selectedPrefs.includes(p.id);
          if (!isEditing && !isSelected) return null;
          return (
            <Chip 
              key={p.id} 
              label={p.name} 
              isActive={isSelected} 
              onPress={() => toggleSelection(p.id, selectedPrefs, setSelectedPrefs)} 
            />
          );
        })}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Restrições e Alergias</Text>
      </View>
      <View style={styles.chipsContainer}>
        {(isEditing || selectedAllergies.length === 0) && (
          <Chip 
            label="Nenhuma" 
            isActive={selectedAllergies.length === 0} 
            onPress={() => isEditing && setSelectedAllergies([])} 
          />
        )}
        {allergies.map((a) => {
          const isSelected = selectedAllergies.includes(a.id);
          if (!isEditing && !isSelected) return null;
          return (
            <Chip 
              key={a.id} 
              label={a.name} 
              isActive={isSelected} 
              onPress={() => toggleSelection(a.id, selectedAllergies, setSelectedAllergies)} 
            />
          );
        })}
      </View>

      <View style={styles.actionsContainer}>
        {isEditing ? (
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Salvar Alterações</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.outlineButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.outlineButtonText}>Editar Minhas Preferências</Text>
          </TouchableOpacity>
        )}

        {!isEditing && (
          <>
            <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('History')}>
              <Ionicons name="book" size={20} color={theme.colors.secondary} style={{ marginRight: 8 }} />
              <Text style={styles.menuButtonText}>Meu Diário Culinário</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Sair da Conta</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}