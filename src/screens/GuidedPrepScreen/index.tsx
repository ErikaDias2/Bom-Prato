import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

import { useAuthStore } from '../../store/authStore';
import { useTimerStore } from '../../store/timerStore';
import { HistoryRepository } from '../../repositories/HistoryRepository';
import { theme } from '../../constants/theme';
import { styles } from './styles';
type VoiceStatus = 'idle' | 'listening' | 'processing' | 'error' | 'unavailable';

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const COMMANDS = {
  NEXT: ['proximo passo', 'proximo', 'avancar', 'seguinte'],
  PREV: ['passo anterior', 'anterior', 'voltar passo', 'voltar'],
  ACTIVATE_TIMER: ['ativar timer', 'iniciar timer', 'comecar timer', 'start timer'],
  PAUSE_TIMER: ['pausar timer', 'pause timer', 'parar timer', 'suspender timer'],
  STOP_ALARM: ['desligar alarme', 'parar alarme', 'silenciar', 'desligar timer'],
  FINISH: ['concluir receita', 'finalizar receita', 'terminar receita', 'concluir'],
};

const matchesCommand = (transcript: string, commandList: string[]): boolean => {
  const normalized = normalize(transcript);
  return commandList.some((cmd) => normalized.includes(cmd));
};

export default function GuidedPrepScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { instructions, recipeId } = route.params;
  const { isLoggedIn, userId } = useAuthStore();
  const { width, height } = useWindowDimensions();

  const { timers, addTimer, toggleTimer, removeTimer } = useTimerStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [userNote, setUserNote] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [playedAlarms, setPlayedAlarms] = useState<Set<string>>(new Set());
  const [isRinging, setIsRinging] = useState(false);
  const [alarmStepLabel, setAlarmStepLabel] = useState<string>('');
  const soundRef = useRef<Audio.Sound | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const lastCommandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLastStep = currentStepIndex === instructions.length - 1;

  const currentStep = instructions[currentStepIndex];
  const currentTimerId = `${recipeId}-step-${currentStepIndex}`;
  const activeTimer = timers.find((t) => t.id === currentTimerId);
  const otherActiveTimers = timers.filter(
    (t) => t.id !== currentTimerId && t.id.startsWith(`${recipeId}-`)
  );

  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.log('Erro ao configurar o modo de áudio', error);
      }
    };
    configureAudio();
  }, []);

  useEffect(() => {
    const playAlarmSound = async () => {
      try {
        if (soundRef.current) return;
        const { sound } = await Audio.Sound.createAsync(
          require('../../../assets/alarm.mp3'),
          { isLooping: true, shouldPlay: true }
        );
        soundRef.current = sound;
        setIsRinging(true);
      } catch (error) {
        console.log('Erro ao carregar o som do alarme', error);
      }
    };

    let shouldRing = false;
    let ringLabel = '';
    timers.forEach((t) => {
      if (
        t.id.startsWith(`${recipeId}-`) &&
        t.remainingSeconds === 0 &&
        !playedAlarms.has(t.id)
      ) {
        setPlayedAlarms((prev) => new Set(prev).add(t.id));
        shouldRing = true;
        ringLabel = t.label ?? '';
      }
    });
    if (shouldRing) {
      setAlarmStepLabel(ringLabel);
      playAlarmSound();
    }
  }, [timers, recipeId, playedAlarms]);

  useEffect(() => {
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
      ExpoSpeechRecognitionModule.abort();
    };
  }, []);

  const isVoiceEnabledRef = useRef(voiceEnabled);
  useEffect(() => {
    isVoiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  const handleStopAlarm = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsRinging(false);
  };

  const cleanUpRecipeTimers = async () => {
    await handleStopAlarm();
    const timersToRemove = timers.filter((t) => t.id.startsWith(`${recipeId}-`));
    timersToRemove.forEach((t) => removeTimer(t.id));
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimerPress = useCallback(() => {
    if (activeTimer) {
      toggleTimer(currentTimerId);
    } else {
      addTimer(
        currentTimerId,
        `Passo ${currentStepIndex + 1} — ${currentStep.text.substring(0, 30)}...`,
        currentStep.timer_seconds
      );
    }
  }, [activeTimer, currentTimerId, currentStepIndex, currentStep, addTimer, toggleTimer]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < instructions.length - 1) {
      setCurrentStepIndex((i) => i + 1);
    } else {
      setShowFinishModal(true);
    }
  }, [currentStepIndex, instructions.length]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) setCurrentStepIndex((i) => i - 1);
  }, [currentStepIndex]);

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled) setImageUri(result.assets[0].uri);
    } catch (error) {
      console.log('Câmera cancelada ou permissão negada.', error);
    }
  };

  const saveHistoryAndFinish = async () => {
    if (isLoggedIn && userId && recipeId) {
      setIsSaving(true);
      try {
        let permanentUri = null;
        if (imageUri) {
          const fileName = `history_${Date.now()}.jpg`;
          const fs: any = FileSystem;
          const permanentDirectory = (fs.documentDirectory || '') + 'history_photos/';
          permanentUri = permanentDirectory + fileName;
          const dirInfo = await fs.getInfoAsync(permanentDirectory);
          if (!dirInfo.exists) {
            await fs.makeDirectoryAsync(permanentDirectory, { intermediates: true });
          }
          await fs.copyAsync({ from: imageUri, to: permanentUri });
        }
        HistoryRepository.saveHistory(userId, recipeId, userNote, permanentUri);
      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível salvar a imagem da sua receita.');
      } finally {
        setIsSaving(false);
      }
    }
    cleanUpRecipeTimers();
    setShowFinishModal(false);
    Alert.alert('🎉 Parabéns!', 'Receita concluída com sucesso!');
    navigation.goBack();
  };

  const exitWithoutSaving = () => {
    cleanUpRecipeTimers();
    setShowFinishModal(false);
    navigation.goBack();
  };

  const startListening = useCallback(async () => {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        Alert.alert(
          'Permissão Negada',
          'O Modo Mãos Livres precisa de acesso ao microfone. Ative nas configurações do dispositivo.'
        );
        setVoiceEnabled(false);
        setVoiceStatus('unavailable');
        return;
      }
      ExpoSpeechRecognitionModule.start({
        lang: 'pt-BR',
        interimResults: false,
        continuous: false,
        maxAlternatives: 1,
      });
      setVoiceStatus('listening');
    } catch (error) {
      console.log('Erro ao iniciar reconhecimento de voz', error);
      setVoiceStatus('error');
    }
  }, []);

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.abort();
    setVoiceStatus('idle');
  }, []);

  const toggleVoiceMode = async () => {
    if (voiceEnabled) {
      setVoiceEnabled(false);
      stopListening();
    } else {
      setVoiceEnabled(true);
      await startListening();
    }
  };

  useSpeechRecognitionEvent('result', (event) => {
    if (!event.results?.length) return;
    const transcript = event.results[0]?.transcript ?? '';
    if (!transcript) return;

    setVoiceStatus('processing');
    processVoiceCommand(transcript);
  });

  useSpeechRecognitionEvent('end', () => {
    if (isVoiceEnabledRef.current) {
      setTimeout(() => {
        if (isVoiceEnabledRef.current) {
          startListening();
        }
      }, 500);
    } else {
      setVoiceStatus('idle');
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (event.error === 'no-speech' || event.error === 'aborted') {
      if (isVoiceEnabledRef.current) {
        setTimeout(() => {
          if (isVoiceEnabledRef.current) startListening();
        }, 500);
      }
      return;
    }
    console.log('Erro no reconhecimento:', event.error);
    setVoiceStatus('error');
  });

  const currentStepIndexRef = useRef(currentStepIndex);
  const isRingingRef = useRef(isRinging);
  const activeTimerRef = useRef(activeTimer);
  const isLastStepRef = useRef(isLastStep);
  const showFinishModalRef = useRef(showFinishModal);
  const isFirstStepRef = useRef(currentStepIndex === 0);

  useEffect(() => { currentStepIndexRef.current = currentStepIndex; }, [currentStepIndex]);
  useEffect(() => { isRingingRef.current = isRinging; }, [isRinging]);
  useEffect(() => { activeTimerRef.current = activeTimer; }, [activeTimer]);
  useEffect(() => { isLastStepRef.current = isLastStep; }, [isLastStep]);
  useEffect(() => { showFinishModalRef.current = showFinishModal; }, [showFinishModal]);
  useEffect(() => { isFirstStepRef.current = currentStepIndex === 0; }, [currentStepIndex]);

  const showFeedback = (message: string) => {
    setLastCommand(message);
    if (lastCommandTimeoutRef.current) clearTimeout(lastCommandTimeoutRef.current);
    lastCommandTimeoutRef.current = setTimeout(() => setLastCommand(null), 3000);
  };

  const processVoiceCommand = useCallback(
    (transcript: string) => {
      console.log('[Voz] Transcrito:', transcript);

      if (matchesCommand(transcript, COMMANDS.STOP_ALARM)) {
        if (isRingingRef.current) {
          handleStopAlarm();
          showFeedback('🔕 Alarme desligado');
          return;
        }
        return;
      }

      if (matchesCommand(transcript, COMMANDS.FINISH)) {
        if (isLastStepRef.current && !showFinishModalRef.current) {
          showFeedback('✅ Concluindo receita...');
          setShowFinishModal(true);
          return;
        }
        return;
      }

      if (matchesCommand(transcript, COMMANDS.NEXT)) {
        if (!showFinishModalRef.current) {
          showFeedback('➡️ Próximo passo');
          handleNext();
          return;
        }
        return;
      }

      if (matchesCommand(transcript, COMMANDS.PREV)) {
        if (!isFirstStepRef.current && !showFinishModalRef.current) {
          showFeedback('⬅️ Passo anterior');
          handlePrev();
          return;
        }
        return;
      }

      if (matchesCommand(transcript, COMMANDS.PAUSE_TIMER)) {
        const timer = activeTimerRef.current;
        if (timer && timer.isRunning && !showFinishModalRef.current) {
          showFeedback('⏸️ Timer pausado');
          handleTimerPress();
          return;
        }
        return;
      }

      if (matchesCommand(transcript, COMMANDS.ACTIVATE_TIMER)) {
        const step = instructions[currentStepIndexRef.current];
        const timer = activeTimerRef.current;
        if (step?.timer_seconds !== null && !showFinishModalRef.current) {
          if (!timer || !timer.isRunning) {
            showFeedback('⏱️ Timer ativado');
            handleTimerPress();
          }
          return;
        }
        return;
      }
    },
    [handleNext, handlePrev, handleTimerPress, instructions]
  );

  const voiceStatusConfig: Record<VoiceStatus, { color: string; label: string; icon: string }> = {
    idle: { color: '#888', label: 'Aguardando...', icon: 'mic-off' },
    listening: { color: '#4CAF50', label: 'Ouvindo...', icon: 'mic' },
    processing: { color: '#FF9800', label: 'Processando...', icon: 'radio' },
    error: { color: '#E24B4A', label: 'Erro. Tente novamente.', icon: 'alert-circle' },
    unavailable: { color: '#E24B4A', label: 'Microfone indisponível', icon: 'mic-off' },
  };

  const statusConfig = voiceStatusConfig[voiceStatus];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>

        <Modal visible={isRinging} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.55)',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 28,
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 20,
                padding: 28,
                width: '100%',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 10,
              }}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: '#FFF0F0',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons name="notifications" size={36} color="#E24B4A" />
              </View>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: theme.colors.text,
                  marginBottom: 8,
                  textAlign: 'center',
                }}
              >
                ⏰ Timer concluído!
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.textLight,
                  textAlign: 'center',
                  marginBottom: 24,
                  lineHeight: 20,
                }}
              >
                {alarmStepLabel
                  ? `O tempo do "${alarmStepLabel}" acabou.`
                  : 'O tempo do passo acabou.'}
              </Text>

              <TouchableOpacity
                style={{
                  backgroundColor: '#E24B4A',
                  borderRadius: 50,
                  paddingVertical: 14,
                  paddingHorizontal: 32,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  justifyContent: 'center',
                }}
                onPress={handleStopAlarm}
              >
                <Ionicons name="notifications-off" size={22} color="#FFF" />
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>
                  Desligar Alarme
                </Text>
              </TouchableOpacity>

              {voiceEnabled && (
                <Text
                  style={{
                    marginTop: 14,
                    fontSize: 12,
                    color: theme.colors.textLight,
                    textAlign: 'center',
                  }}
                >
                  🎤 Ou diga <Text style={{ fontWeight: '700' }}>"Desligar alarme"</Text>
                </Text>
              )}
            </View>
          </View>
        </Modal>

        <View style={styles.progressHeader}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.progressText}>
              Passo {currentStepIndex + 1} de {instructions.length}
            </Text>

            <TouchableOpacity
              onPress={toggleVoiceMode}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: voiceEnabled
                  ? `${statusConfig.color}22`
                  : `${theme.colors.textLight}22`,
                borderWidth: 1,
                borderColor: voiceEnabled ? statusConfig.color : theme.colors.textLight,
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 5,
                gap: 5,
              }}
            >
              <Ionicons
                name={voiceEnabled ? (statusConfig.icon as any) : 'mic-outline'}
                size={16}
                color={voiceEnabled ? statusConfig.color : theme.colors.textLight}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: voiceEnabled ? statusConfig.color : theme.colors.textLight,
                }}
              >
                {voiceEnabled ? 'Mãos Livres' : 'Voz'}
              </Text>
              {voiceStatus === 'listening' && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#4CAF50',
                  }}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${((currentStepIndex + 1) / instructions.length) * 100}%` },
              ]}
            />
          </View>

          {otherActiveTimers.length > 0 && (
            <TouchableOpacity
              style={styles.timersBadge}
              onPress={() => navigation.navigate('Timers')}
            >
              <Ionicons name="timer-outline" size={16} color="#FF6A00" />
              <Text style={styles.timersBadgeText}>
                {otherActiveTimers.length} timer{otherActiveTimers.length > 1 ? 's' : ''} da receita rodando
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#FF6A00" />
            </TouchableOpacity>
          )}

          {lastCommand && (
            <View
              style={{
                marginTop: 8,
                backgroundColor: `${theme.colors.primary}18`,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
                alignSelf: 'flex-start',
              }}
            >
              <Text style={{ fontSize: 13, color: theme.colors.primary, fontWeight: '600' }}>
                {lastCommand}
              </Text>
            </View>
          )}

          {voiceEnabled && (
            <View
              style={{
                marginTop: 8,
                backgroundColor: `${theme.colors.textLight}11`,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ fontSize: 11, color: theme.colors.textLight, lineHeight: 18 }}>
                🎤 Diga:{' '}
                {currentStepIndex > 0 && (
                  <>
                    <Text style={{ fontWeight: '600', color: theme.colors.text }}>
                      "Passo anterior"
                    </Text>
                    {' • '}
                  </>
                )}
                <Text style={{ fontWeight: '600', color: theme.colors.text }}>
                  "Próximo passo"
                </Text>
                {currentStep.timer_seconds !== null && !activeTimer?.isRunning && (
                  <>
                    {' • '}
                    <Text style={{ fontWeight: '600', color: theme.colors.text }}>
                      "Ativar timer"
                    </Text>
                  </>
                )}
                {activeTimer?.isRunning && (
                  <>
                    {' • '}
                    <Text style={{ fontWeight: '600', color: theme.colors.text }}>
                      "Pausar timer"
                    </Text>
                  </>
                )}
                {isRinging && (
                  <>
                    {' • '}
                    <Text style={{ fontWeight: '600', color: '#E24B4A' }}>
                      "Desligar alarme"
                    </Text>
                  </>
                )}
                {isLastStep && (
                  <>
                    {' • '}
                    <Text style={{ fontWeight: '600', color: theme.colors.primary }}>
                      "Concluir receita"
                    </Text>
                  </>
                )}
              </Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.mainContent,
            { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: width * 0.05 },
          ]}
        >
          <Text
            style={[
              styles.instructionText,
              { fontSize: width * 0.055, textAlign: 'center', marginBottom: height * 0.05 },
            ]}
          >
            {currentStep.text}
          </Text>

          {currentStep.timer_seconds !== null && (
            <View style={[styles.timerContainer, { alignItems: 'center' }]}>
              <Text
                style={[
                  styles.timerDisplay,
                  { fontSize: width * 0.18, fontWeight: 'bold', marginBottom: height * 0.03 },
                ]}
              >
                {activeTimer
                  ? formatTime(activeTimer.remainingSeconds)
                  : formatTime(currentStep.timer_seconds)}
              </Text>

              <TouchableOpacity
                style={[
                  styles.timerButton,
                  activeTimer?.isRunning ? styles.timerButtonStop : styles.timerButtonStart,
                  {
                    width: width * 0.7,
                    paddingVertical: height * 0.02,
                    borderRadius: 50,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
                onPress={handleTimerPress}
              >
                <Ionicons
                  name={activeTimer?.isRunning ? 'pause' : 'play'}
                  size={width * 0.07}
                  color={theme.colors.card}
                />
                <Text style={[styles.timerButtonText, { fontSize: width * 0.045, marginLeft: 10 }]}>
                  {activeTimer
                    ? activeTimer.isRunning
                      ? 'Pausar Timer'
                      : 'Retomar Timer'
                    : 'Iniciar Timer'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.footerControls}>
          <TouchableOpacity
            style={[styles.controlButton, currentStepIndex === 0 && styles.controlButtonDisabled]}
            onPress={handlePrev}
            disabled={currentStepIndex === 0}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={currentStepIndex === 0 ? theme.colors.textLight : theme.colors.primary}
            />
            <Text
              style={[
                styles.controlButtonText,
                currentStepIndex === 0 && { color: theme.colors.textLight },
              ]}
            >
              Anterior
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {isLastStep ? 'Concluir' : 'Próximo'}
            </Text>
            <Ionicons
              name={isLastStep ? 'checkmark' : 'arrow-forward'}
              size={24}
              color={theme.colors.card}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showFinishModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Receita Concluída!</Text>

            {isLoggedIn ? (
              <>
                <Text style={styles.modalSub}>
                  Tire uma foto e anote o que achou para o seu Diário!
                </Text>
                {imageUri ? (
                  <View style={styles.photoPreviewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.photoPreview} contentFit="cover" />
                    <TouchableOpacity style={styles.photoRetakeBtn} onPress={takePhoto}>
                      <Ionicons name="camera-reverse" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
                    <Ionicons name="camera" size={28} color={theme.colors.primary} />
                    <Text style={styles.cameraButtonText}>Tirar Foto do Prato</Text>
                  </TouchableOpacity>
                )}

                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={3}
                  placeholder="Ex: Ficou ótimo, mas da próxima vez colocarei menos sal..."
                  placeholderTextColor={theme.colors.textLight}
                  value={userNote}
                  onChangeText={setUserNote}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[styles.saveHistoryButton, isSaving && { opacity: 0.7 }]}
                  onPress={saveHistoryAndFinish}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.saveHistoryText}>Salvar no meu Diário e Sair</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalSub}>
                  Parabéns por finalizar o prato! Faça login para desbloquear o Diário Culinário.
                </Text>
                <TouchableOpacity style={styles.saveHistoryButton} onPress={exitWithoutSaving}>
                  <Text style={styles.saveHistoryText}>Sair</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}