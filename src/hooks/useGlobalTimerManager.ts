import { useEffect, useRef, useCallback } from 'react';
import { AppState, Alert, Vibration } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useTimerStore, TimerItem } from '../store/timerStore';

export function useGlobalTimerManager() {
  const tick = useTimerStore((state) => state.tick);
  const removeTimer = useTimerStore((state) => state.removeTimer);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleTimerFinished = useCallback(
    async (timer: TimerItem) => {
      Vibration.vibrate([0, 500, 200, 500, 200, 500]);
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ Timer concluído!',
            body: timer.label,
            sound: true,
          },
          trigger: null,
        });
      } catch (e) {
      }
      Alert.alert(
        '⏰ Timer concluído!',
        `"${timer.label}" chegou ao fim.`,
        [
          {
            text: 'OK',
            onPress: () => {
              removeTimer(timer.id);
              Vibration.cancel();
            },
          },
        ],
        { cancelable: false }
      );
    },
    [removeTimer]
  );

  const startInterval = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      tick(handleTimerFinished);
    }, 1000);
  }, [tick, handleTimerFinished]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startInterval();

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        startInterval();
      } else {
        stopInterval();
      }
    });

    return () => {
      stopInterval();
      sub.remove();
    };
  }, [startInterval, stopInterval]);
}