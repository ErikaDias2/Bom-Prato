import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useAuthStore } from '../../store/authStore';
import { HistoryRepository } from '../../repositories/HistoryRepository';
import { theme } from '../../constants/theme';
import { styles } from './styles';

export default function GuidedPrepScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { instructions, recipeId } = route.params;
  const { isLoggedIn, userId } = useAuthStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [userNote, setUserNote] = useState('');

  const player = useAudioPlayer('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
  const currentStep = instructions[currentStepIndex];

  useEffect(() => {
    if (currentStep.timer_seconds) setTimeLeft(currentStep.timer_seconds);
    else setTimeLeft(0);
    setIsTimerRunning(false);
  }, [currentStepIndex]);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      
      player.loop = true;
      player.play();

      Alert.alert(
        '⏰ Tempo Esgotado!', 
        'Pode ir para o próximo passo!',
        [
          {
            text: 'Desligar Alarme',
            onPress: () => {
              player.pause();
              player.seekTo(0);
            }
          }
        ],
        { cancelable: false } 
      );
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, player]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentStepIndex < instructions.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setShowFinishModal(true);
    }
  };

  const saveHistoryAndFinish = () => {
    if (isLoggedIn && userId && recipeId) {
      HistoryRepository.saveHistory(userId, recipeId, userNote);
    }
    setShowFinishModal(false);
    Alert.alert('🎉 Parabéns!', 'Receita concluída com sucesso!');
    navigation.goBack();
  };

  const exitWithoutSaving = () => {
    setShowFinishModal(false);
    navigation.goBack();
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Passo {currentStepIndex + 1} de {instructions.length}
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${((currentStepIndex + 1) / instructions.length) * 100}%` }]} />
          </View>
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.instructionText}>{currentStep.text}</Text>

          {currentStep.timer_seconds !== null && (
            <View style={styles.timerContainer}>
              <Text style={styles.timerDisplay}>{formatTime(timeLeft)}</Text>
              <TouchableOpacity 
                style={[styles.timerButton, isTimerRunning ? styles.timerButtonStop : styles.timerButtonStart]}
                onPress={() => setIsTimerRunning(!isTimerRunning)}
              >
                <Ionicons name={isTimerRunning ? "pause" : "play"} size={24} color={theme.colors.card} />
                <Text style={styles.timerButtonText}>
                  {isTimerRunning ? 'Pausar Timer' : 'Iniciar Timer'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.footerControls}>
          <TouchableOpacity style={[styles.controlButton, currentStepIndex === 0 && styles.controlButtonDisabled]} onPress={handlePrev} disabled={currentStepIndex === 0}>
            <Ionicons name="arrow-back" size={24} color={currentStepIndex === 0 ? theme.colors.textLight : theme.colors.primary} />
            <Text style={[styles.controlButtonText, currentStepIndex === 0 && { color: theme.colors.textLight }]}>Anterior</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentStepIndex === instructions.length - 1 ? 'Concluir' : 'Próximo'}
            </Text>
            <Ionicons name={currentStepIndex === instructions.length - 1 ? "checkmark" : "arrow-forward"} size={24} color={theme.colors.card} />
          </TouchableOpacity>
        </View>

      </View>
      
      <Modal visible={showFinishModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Receita Concluída!</Text>
            
            {isLoggedIn ? (
              <>
                <Text style={styles.modalSub}>Como ficou o prato? Quer deixar alguma anotação para a próxima vez? (Opcional)</Text>
                <TextInput 
                  style={styles.textArea} 
                  multiline 
                  numberOfLines={4} 
                  placeholder="Ex: Ficou ótimo, mas da próxima vez..." 
                  placeholderTextColor={theme.colors.textLight}
                  value={userNote} 
                  onChangeText={setUserNote} 
                  textAlignVertical="top"
                />
                <TouchableOpacity style={styles.saveHistoryButton} onPress={saveHistoryAndFinish}>
                  <Text style={styles.saveHistoryText}>Salvar no meu Diário e Sair</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalSub}>Parabéns por finalizar o prato! Faça login no app para desbloquear o Diário Culinário e salvar anotações sobre suas receitas.</Text>
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