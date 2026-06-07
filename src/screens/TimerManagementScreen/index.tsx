import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTimerStore, TimerItem } from '../../store/timerStore';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

function TimerCard({ item, onToggle, onRemove }: {
  item: TimerItem;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isUrgent = item.remainingSeconds <= 60 && item.remainingSeconds > 0;
  const isDone = item.remainingSeconds === 0;
  const pct = (item.remainingSeconds / item.totalSeconds) * 100;

  useEffect(() => {
    if (isUrgent && item.isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isUrgent, item.isRunning]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const timeColor = isDone
    ? theme.colors.textLight
    : isUrgent
    ? '#E24B4A'
    : theme.colors.primary;

  const barColor = isDone
    ? theme.colors.border
    : isUrgent
    ? '#E24B4A'
    : theme.colors.primary;

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: pulseAnim }] }]}>
      <View style={styles.cardTop}>
        <Text style={styles.cardLabel} numberOfLines={1}>{item.label}</Text>
        {isDone && (
          <View style={styles.doneBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#3B6D11" />
            <Text style={styles.doneText}>Concluído</Text>
          </View>
        )}
      </View>

      <Text style={[styles.timeText, { color: timeColor }]}>
        {formatTime(item.remainingSeconds)}
      </Text>
      
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>

      {!isDone && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: theme.colors.primary }]}
            onPress={onToggle}
          >
            <Ionicons
              name={item.isRunning ? 'pause' : 'play'}
              size={18}
              color={theme.colors.primary}
            />
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>
              {item.isRunning ? 'Pausar' : 'Retomar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.removeBtn]}
            onPress={onRemove}
          >
            <Ionicons name="trash-outline" size={18} color="#E24B4A" />
            <Text style={[styles.actionText, { color: '#E24B4A' }]}>Remover</Text>
          </TouchableOpacity>
        </View>
      )}

      {isDone && (
        <TouchableOpacity style={[styles.actionBtn, styles.removeBtn, { marginTop: 8 }]} onPress={onRemove}>
          <Ionicons name="close" size={18} color={theme.colors.textLight} />
          <Text style={[styles.actionText, { color: theme.colors.textLight }]}>Dispensar</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

export default function TimerManagementScreen() {
  const { timers, toggleTimer, removeTimer } = useTimerStore();

  if (timers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="timer-outline" size={64} color={theme.colors.textLight} />
        <Text style={styles.emptyTitle}>Nenhum timer ativo</Text>
        <Text style={styles.emptySubtitle}>
          Inicie um timer no modo de preparo de uma receita para vê-lo aqui.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={timers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <TimerCard
            item={item}
            onToggle={() => toggleTimer(item.id)}
            onRemove={() => removeTimer(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 13,
    color: theme.colors.textLight,
    flex: 1,
    marginRight: 8,
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3DE',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  doneText: {
    fontSize: 12,
    color: '#3B6D11',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 36,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 10,
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  removeBtn: {
    borderColor: '#F0C0C0',
    marginLeft: 'auto',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});