import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import Chip from '../../components/Chip';
import { useAuthStore } from '../../store/authStore';
import { UserRepository } from '../../repositories/UserRepository';
import { theme } from '../../constants/theme';
import { styles } from './styles';
import * as Updates from 'expo-updates';
import { getDb, reopenDatabase } from '../../services/database';

const substitutionsData = [
  { term: "Creme de Leite", desc: "Substitua por: Iogurte natural (mesma quantidade, mas não ferva para não talhar) ou Creme de Ricota." },
  { term: "Leite Condensado", desc: "Substitua por: 1 xícara de leite em pó + 1/2 xícara de água quente + 1/2 xícara de açúcar batidos no liquidificador." },
  { term: "Manteiga (em bolos)", desc: "Substitua por: Óleo vegetal (use 3/4 da quantidade pedida de manteiga) ou Purê de maçã (para versões fit)." },
  { term: "Ovo (em massas)", desc: "Substitua por: 1/2 banana amassada OU 1 colher de sopa de linhaça hidratada em 3 colheres de água." },
  { term: "Açúcar Branco", desc: "Substitua por: Açúcar mascavo, demerara, mel (reduza os líquidos da receita) ou adoçante culinário." },
  { term: "Farinha de Trigo (para engrossar)", desc: "Substitua por: Amido de milho (Maizena) ou Fécula de batata (use metade da quantidade pedida de trigo)." },
  { term: "Leite de Vaca", desc: "Substitua por: Leite de aveia, amêndoas, soja ou até água (em pães e massas simples)." },
  { term: "Fermento em Pó", desc: "Substitua por: 1/4 de colher de chá de bicarbonato de sódio + 1/2 colher de chá de vinagre ou suco de limão." },
  { term: "Queijo Parmesão", desc: "Substitua por: Queijo provolone ralado seco ou levedura nutricional (para opções veganas)." },
  { term: "Molho Shoyu", desc: "Substitua por: Molho inglês (em menor quantidade) ou Aminos de Coco." },
  { term: "Cebola", desc: "Substitua por: Alho-poró ou cebolinha verde (a parte branca)." },
  { term: "Pão Ralado (Farinha de Rosca)", desc: "Substitua por: Aveia em flocos finos, biscoito cream cracker triturado ou farinha de milho flocada." }
];

const getDbFilesPath = () => `${FileSystem.documentDirectory}SQLite/bomprato_v6.db`;
const getTempDbPath = () => `${FileSystem.documentDirectory}bomprato_backup_temp.db`;

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { isLoggedIn, userId, logout } = useAuthStore();

  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedPrefs, setSelectedPrefs] = useState<number[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<number[]>([]);

  const [showSubstitutionsModal, setShowSubstitutionsModal] = useState(false);
  const [subSearch, setSubSearch] = useState('');

  const handleExportBackup = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) return Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo.');
      try { getDb().execSync('PRAGMA wal_checkpoint(FULL);'); } catch {}

      const dbPath = getDbFilesPath();
      const fileInfo = await (FileSystem as any).getInfoAsync(dbPath);
      console.log('=== EXPORT BACKUP ===');
      console.log('Caminho:', dbPath);
      console.log('Existe?', fileInfo.exists, '| Tamanho:', (fileInfo as any).size ?? 'N/A');

      if (!fileInfo.exists || (fileInfo as any).size <= 4096) {
        return Alert.alert('Erro', 'Banco de dados vazio ou não encontrado.');
      }

      await Sharing.shareAsync(dbPath, {
        mimeType: 'application/octet-stream',
        dialogTitle: 'Salvar Backup Bom Prato',
        UTI: 'public.database',
      });
    } catch (error) {
      console.error('Erro no backup:', error);
      Alert.alert('Erro', 'Falha ao gerar o backup.');
    }
  };

  const handleImportBackup = () => {
    Alert.alert(
      'Restaurar Backup',
      'Isto irá substituir todos os dados atuais pelo arquivo de backup. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                copyToCacheDirectory: true,
                type: '*/*',
              });
              if (result.canceled) return;

              const fileUri = result.assets[0].uri;
              const dbPath = getDbFilesPath();
              const tempPath = getTempDbPath();
              const fileInfo = await (FileSystem as any).getInfoAsync(fileUri);
              console.log('=== IMPORT BACKUP ===');
              console.log('Arquivo selecionado:', fileUri);
              console.log('Tamanho do backup:', (fileInfo as any).size ?? 'N/A');
              if (!fileInfo.exists) return Alert.alert('Erro', 'Arquivo não encontrado.');
              await (FileSystem as any).copyAsync({ from: fileUri, to: tempPath });
              await getDb().closeAsync();
              const walInfo = await (FileSystem as any).getInfoAsync(`${dbPath}-wal`);
              if (walInfo.exists) await (FileSystem as any).deleteAsync(`${dbPath}-wal`);
              const shmInfo = await (FileSystem as any).getInfoAsync(`${dbPath}-shm`);
              if (shmInfo.exists) await (FileSystem as any).deleteAsync(`${dbPath}-shm`);
              await (FileSystem as any).deleteAsync(dbPath, { idempotent: true });
              await (FileSystem as any).copyAsync({ from: tempPath, to: dbPath });

              await (FileSystem as any).deleteAsync(tempPath, { idempotent: true });

              reopenDatabase();
              logout();

              Alert.alert(
                'Backup Restaurado!',
                'Seus dados foram restaurados. Faça login novamente para continuar.',
                [{
                  text: 'OK',
                  onPress: async () => {
                    try { await Updates.reloadAsync(); }
                    catch {
                      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
                    }
                  },
                }]
              );
            } catch (error) {
              console.error('Erro na restauração:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao tentar restaurar o backup.');
            }
          },
        },
      ]
    );
  };

  const loadProfileData = useCallback(() => {
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
  }, [isLoggedIn, userId]);

  useFocusEffect(loadProfileData);

  const filteredSubstitutions = substitutionsData.filter(item =>
    item.term.toLowerCase().includes(subSearch.toLowerCase()) ||
    item.desc.toLowerCase().includes(subSearch.toLowerCase())
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
    <View style={{ flex: 1 }}>
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
            <Chip label="Nenhuma" isActive={selectedPrefs.length === 0} onPress={() => isEditing && setSelectedPrefs([])} />
          )}
          {preferences.map((p) => {
            const isSelected = selectedPrefs.includes(p.id);
            if (!isEditing && !isSelected) return null;
            return <Chip key={p.id} label={p.name} isActive={isSelected} onPress={() => toggleSelection(p.id, selectedPrefs, setSelectedPrefs)} />;
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Restrições e Alergias</Text>
        </View>
        <View style={styles.chipsContainer}>
          {(isEditing || selectedAllergies.length === 0) && (
            <Chip label="Nenhuma" isActive={selectedAllergies.length === 0} onPress={() => isEditing && setSelectedAllergies([])} />
          )}
          {allergies.map((a) => {
            const isSelected = selectedAllergies.includes(a.id);
            if (!isEditing && !isSelected) return null;
            return <Chip key={a.id} label={a.name} isActive={isSelected} onPress={() => toggleSelection(a.id, selectedAllergies, setSelectedAllergies)} />;
          })}
        </View>

        <View style={styles.actionsContainer}>
          {isEditing ? (
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Salvar Alterações</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.outlineButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.outlineButtonText}>Editar Minhas Preferências</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('CustomCategories')}>
                <Ionicons name="grid-outline" size={20} color={theme.colors.secondary} style={{ marginRight: 8 }} />
                <Text style={styles.menuButtonText}>Minhas Categorias Personalizadas</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('History')}>
                <Ionicons name="book" size={20} color={theme.colors.secondary} style={{ marginRight: 8 }} />
                <Text style={styles.menuButtonText}>Meu Diário Culinário</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('SavedRecipes')}>
                <Ionicons name="cloud-done-outline" size={20} color={theme.colors.secondary} style={{ marginRight: 8 }} />
                <Text style={styles.menuButtonText}>Receitas Salvas (Off-line)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Fridge')}>
                <Ionicons name="snow-outline" size={20} color={theme.colors.secondary} style={{ marginRight: 8 }} />
                <Text style={styles.menuButtonText}>O que tem na geladeira?</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuButton} onPress={() => setShowSubstitutionsModal(true)}>
                <Ionicons name="swap-horizontal-outline" size={20} color={theme.colors.secondary} style={{ marginRight: 8 }} />
                <Text style={styles.menuButtonText}>Substituições de Ingredientes</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} style={{ marginRight: 8 }} />
                <Text style={styles.logoutText}>Sair da Conta</Text>
              </TouchableOpacity>

              <View style={{ marginTop: 30, borderTopWidth: 1, borderColor: '#EEE', paddingTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12 }}>Segurança e Dados</Text>

                <TouchableOpacity style={[styles.outlineButton, { marginBottom: 10 }]} onPress={handleExportBackup}>
                  <Ionicons name="cloud-upload-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.outlineButtonText}>Gerar Arquivo de Backup</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.outlineButton} onPress={handleImportBackup}>
                  <Ionicons name="cloud-download-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.outlineButtonText}>Restaurar Backup</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <Modal visible={showSubstitutionsModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' }}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>Faltou Ingrediente?</Text>
              <TouchableOpacity onPress={() => {
                setShowSubstitutionsModal(false);
                setSubSearch('');
              }}>
                <Ionicons name="close-circle" size={28} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 14, color: theme.colors.textLight, marginBottom: 16 }}>
              Descubra como substituir ingredientes comuns e salve sua receita!
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingHorizontal: 12, borderRadius: 8, height: 46, marginBottom: 16 }}>
              <Ionicons name="search" size={20} color={theme.colors.primary} />
              <TextInput
                style={{ flex: 1, marginLeft: 8, fontSize: 16, color: theme.colors.text }}
                placeholder="Buscar ingrediente..."
                placeholderTextColor={theme.colors.textLight}
                value={subSearch}
                onChangeText={setSubSearch}
              />
            </View>

            <FlatList
              data={filteredSubstitutions}
              keyExtractor={(item) => item.term}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <View style={{ backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E0E0E0' }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 4 }}>
                    {item.term}
                  </Text>
                  <Text style={{ fontSize: 14, color: theme.colors.text, lineHeight: 20 }}>
                    {item.desc}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: theme.colors.textLight, marginTop: 20 }}>
                  Nenhuma substituição encontrada para "{subSearch}".
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}