import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Share,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useAuthStore } from '../../store/authStore';
import { RecipeRepository } from '../../repositories/RecipeRepository';
import { theme } from '../../constants/theme';
import { styles } from './styles';

type VoiceStatus = 'idle' | 'listening' | 'processing' | 'success' | 'error' | 'unavailable';

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const ADD_PREFIXES = [
  'adicionar ',
  'adiciona ',
  'add ',
  'colocar ',
  'coloca ',
  'incluir ',
  'inclui ',
  'quero ',
  'preciso de ',
  'comprar ',
];

const extractItemName = (transcript: string): string | null => {
  const n = normalize(transcript);
  for (const prefix of ADD_PREFIXES) {
    if (n.startsWith(prefix)) {
      const item = transcript.trim().slice(prefix.length).trim();
      return item.length > 0 ? capitalize(item) : null;
    }
  }
  const words = transcript.trim().split(/\s+/);
  if (words.length <= 4 && words.length >= 1) {
    return capitalize(transcript.trim());
  }
  return null;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export default function ShoppingListScreen() {
  const route = useRoute<any>();
  const { startDate, endDate } = route.params;
  const { userId } = useAuthStore();

  const [ingredientsList, setIngredientsList] = useState<any[]>([]);
  const [customItems, setCustomItems] = useState<any[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [newItemText, setNewItemText] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [lastAddedItem, setLastAddedItem] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const isVoiceActiveRef = useRef(false);

  const storageKey = `@shopping_list_${userId}_${startDate}_${endDate}`;

  useEffect(() => {
    const loadData = async () => {
      if (userId) {
        const weeklyPlan = RecipeRepository.getWeeklyPlan(userId, startDate, endDate);
        const aggregated: Record<string, any> = {};

        weeklyPlan.forEach((plan: any) => {
          const ingredients = JSON.parse(plan.ingredients || '[]');
          ingredients.forEach((ing: any) => {
            const unitNormalized = ing.unit.toLowerCase().trim().replace(/s$/, '');
            const nameNormalized = ing.name.toLowerCase().trim();
            const key = `${nameNormalized}_${unitNormalized}`;

            if (!aggregated[key]) {
              aggregated[key] = { name: ing.name, unit: unitNormalized, amount: 0, isCustom: false };
            }
            aggregated[key].amount += ing.amount;
          });
        });

        const finalArray = Object.values(aggregated).sort((a: any, b: any) =>
          a.name.localeCompare(b.name)
        );
        setIngredientsList(finalArray);
      }

      try {
        const savedData = await AsyncStorage.getItem(storageKey);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setCheckedItems(parsed.checkedItems || {});
          setCustomItems(parsed.customItems || []);
        }
      } catch (e) {
        console.error('Erro ao carregar lista:', e);
      }

      setIsLoaded(true);
    };

    loadData();
  }, [userId, startDate, endDate, storageKey]);

  useEffect(() => {
    if (isLoaded) {
      const saveData = async () => {
        try {
          await AsyncStorage.setItem(
            storageKey,
            JSON.stringify({ checkedItems, customItems })
          );
        } catch (e) {
          console.error('Erro ao salvar lista:', e);
        }
      };
      saveData();
    }
  }, [checkedItems, customItems, isLoaded, storageKey]);

  const startPulse = useCallback(() => {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.current.start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseLoop.current?.stop();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [pulseAnim]);

  const startListening = useCallback(async () => {
    try {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        setVoiceStatus('unavailable');
        setShowVoiceModal(false);
        return;
      }
      ExpoSpeechRecognitionModule.start({
        lang: 'pt-BR',
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
      });
      setVoiceStatus('listening');
      setVoiceTranscript('');
      setLastAddedItem('');
      startPulse();
    } catch (error) {
      console.log('Erro ao iniciar voz:', error);
      setVoiceStatus('error');
    }
  }, [startPulse]);

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.abort();
    stopPulse();
    setVoiceStatus('idle');
  }, [stopPulse]);

  const openVoiceModal = async () => {
    isVoiceActiveRef.current = true;
    setShowVoiceModal(true);
    setVoiceTranscript('');
    setLastAddedItem('');
    setVoiceStatus('idle');
    setTimeout(() => startListening(), 300);
  };

  const closeVoiceModal = () => {
    isVoiceActiveRef.current = false;
    stopListening();
    setShowVoiceModal(false);
    setVoiceStatus('idle');
    setVoiceTranscript('');
  };

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results?.[0]?.transcript ?? '';
    setVoiceTranscript(transcript);

    if (!event.isFinal) return;

    setVoiceStatus('processing');
    stopPulse();

    const itemName = extractItemName(transcript);

    if (itemName) {
      const newItem = {
        name: itemName,
        amount: '',
        unit: '',
        isCustom: true,
        key: `custom_${Date.now()}`,
      };
      setCustomItems((prev) => [newItem, ...prev]);
      setLastAddedItem(itemName);
      setVoiceStatus('success');
    } else {
      setVoiceStatus('error');
    }

    if (isVoiceActiveRef.current) {
      setTimeout(() => {
        if (isVoiceActiveRef.current) {
          setVoiceTranscript('');
          setVoiceStatus('listening');
          startListening();
        }
      }, 1200);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    if (isVoiceActiveRef.current && voiceStatus === 'listening') {
      setTimeout(() => {
        if (isVoiceActiveRef.current) startListening();
      }, 400);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (event.error === 'no-speech' || event.error === 'aborted') {
      if (isVoiceActiveRef.current) {
        setTimeout(() => {
          if (isVoiceActiveRef.current) startListening();
        }, 400);
      }
      return;
    }
    stopPulse();
    setVoiceStatus('error');
  });

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddCustomItem = () => {
    if (newItemText.trim() === '') return;
    const newItem = {
      name: newItemText.trim(),
      amount: '',
      unit: '',
      isCustom: true,
      key: `custom_${Date.now()}`,
    };
    setCustomItems((prev) => [newItem, ...prev]);
    setNewItemText('');
  };

  const handleRemoveCustomItem = (key: string) => {
    setCustomItems((prev) => prev.filter((item) => item.key !== key));
    const newChecked = { ...checkedItems };
    delete newChecked[key];
    setCheckedItems(newChecked);
  };

  const formatExibitionDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}`;
  };

  const fullList = [...customItems, ...ingredientsList];

  const handleShare = async () => {
    const listText = fullList
      .map((item) => {
        const key = item.isCustom ? item.key : `${item.name}_${item.unit}`;
        const status = checkedItems[key] ? '✅' : '⬜';
        const amountStr = item.isCustom ? '' : `${item.amount} ${item.unit} de `;
        return `${status} ${amountStr}${item.name}${item.isCustom ? ' (Avulso)' : ''}`;
      })
      .join('\n');

    const message = `🛒 *Minha Lista de Compras*\n📅 Semana: ${formatExibitionDate(startDate)} a ${formatExibitionDate(endDate)}\n\n${listText}\n\n_Gerado pelo app Bom Prato_ 🥘`;

    try {
      await Share.share({ message, title: 'Lista de Compras' });
    } catch (error) {
      console.error(error);
    }
  };

  const voiceStatusConfig: Record<
    VoiceStatus,
    { color: string; icon: string; label: string }
  > = {
    idle:        { color: theme.colors.textLight, icon: 'mic-outline',       label: 'Iniciando...' },
    listening:   { color: '#4CAF50',              icon: 'mic',               label: 'Ouvindo... Diga o item!' },
    processing:  { color: '#FF9800',              icon: 'radio',             label: 'Processando...' },
    success:     { color: '#4CAF50',              icon: 'checkmark-circle',  label: 'Item adicionado!' },
    error:       { color: '#E24B4A',              icon: 'alert-circle',      label: 'Não entendi. Tente novamente.' },
    unavailable: { color: '#E24B4A',              icon: 'mic-off',           label: 'Microfone indisponível.' },
  };

  const statusCfg = voiceStatusConfig[voiceStatus];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerInfo}>
        <View style={styles.headerTextContainer}>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.headerText}>
            Semana de {formatExibitionDate(startDate)} até {formatExibitionDate(endDate)}
          </Text>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social" size={20} color="#FFF" />
          <Text style={styles.shareText}>Compartilhar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addItemContainer}>
        <TextInput
          style={[styles.addItemInput, { flex: 1 }]}
          placeholder="Adicionar item avulso"
          placeholderTextColor={theme.colors.textLight}
          value={newItemText}
          onChangeText={setNewItemText}
          onSubmitEditing={handleAddCustomItem}
        />
        <TouchableOpacity style={styles.addItemButton} onPress={handleAddCustomItem}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={openVoiceModal}
          style={{
            marginLeft: 8,
            backgroundColor: theme.colors.primary,
            borderRadius: 12,
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="mic" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {fullList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={theme.colors.textLight} />
          <Text style={styles.emptyText}>Sua lista de compras está vazia.</Text>
        </View>
      ) : (
        <FlatList
          data={fullList}
          keyExtractor={(item) => (item.isCustom ? item.key : `${item.name}_${item.unit}`)}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const key = item.isCustom ? item.key : `${item.name}_${item.unit}`;
            const isChecked = checkedItems[key];

            return (
              <TouchableOpacity
                style={styles.itemRow}
                onPress={() => toggleCheck(key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isChecked ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={isChecked ? theme.colors.primary : theme.colors.textLight}
                />
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, isChecked && styles.textCrossed]}>
                    {item.name}{' '}
                    {item.isCustom && <Text style={styles.customBadge}>(Avulso)</Text>}
                  </Text>
                  {!item.isCustom && (
                    <Text style={[styles.itemAmount, isChecked && styles.textCrossed]}>
                      {item.amount} {item.unit}
                      {item.amount > 1 && item.unit.length > 2 && !item.unit.endsWith('s')
                        ? 's'
                        : ''}
                    </Text>
                  )}
                </View>
                {item.isCustom && (
                  <TouchableOpacity
                    onPress={() => handleRemoveCustomItem(item.key)}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="trash-outline" size={20} color={theme.colors.textLight} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      <Modal visible={showVoiceModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.45)',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 28,
              paddingTop: 20,
              paddingBottom: 40,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: `${theme.colors.textLight}55`,
                marginBottom: 20,
              }}
            />

            <Text
              style={{
                fontSize: 17,
                fontWeight: '700',
                color: theme.colors.text,
                marginBottom: 6,
              }}
            >
              Adicionar por Voz
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: theme.colors.textLight,
                textAlign: 'center',
                marginBottom: 28,
                lineHeight: 18,
              }}
            >
              Diga <Text style={{ fontWeight: '700', color: theme.colors.text }}>"adicionar leite"</Text>
              {' '}ou apenas{' '}
              <Text style={{ fontWeight: '700', color: theme.colors.text }}>"ovos"</Text>.
              {'\n'}O microfone fica ativo até você fechar.
            </Text>

            <Animated.View
              style={{
                transform: [{ scale: voiceStatus === 'listening' ? pulseAnim : 1 }],
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: `${statusCfg.color}20`,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: `${statusCfg.color}35`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={statusCfg.icon as any}
                  size={36}
                  color={statusCfg.color}
                />
              </View>
            </Animated.View>

            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: statusCfg.color,
                marginBottom: 12,
              }}
            >
              {statusCfg.label}
            </Text>

            <View
              style={{
                minHeight: 44,
                backgroundColor: `${theme.colors.textLight}12`,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 10,
                width: '100%',
                marginBottom: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: voiceTranscript ? theme.colors.text : theme.colors.textLight,
                  textAlign: 'center',
                  fontStyle: voiceTranscript ? 'normal' : 'italic',
                }}
              >
                {voiceTranscript || 'Aguardando fala...'}
              </Text>
            </View>

            {lastAddedItem !== '' && voiceStatus === 'success' && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: '#4CAF5018',
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  marginBottom: 16,
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={{ fontSize: 14, color: '#4CAF50', fontWeight: '600' }}>
                  "{lastAddedItem}" adicionado à lista!
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={closeVoiceModal}
              style={{
                marginTop: 4,
                borderWidth: 1.5,
                borderColor: `${theme.colors.textLight}55`,
                borderRadius: 50,
                paddingVertical: 12,
                paddingHorizontal: 40,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Ionicons name="close" size={18} color={theme.colors.textLight} />
              <Text style={{ fontSize: 15, color: theme.colors.textLight, fontWeight: '600' }}>
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}