import { create } from 'zustand';

export interface TimerItem {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}

interface TimerStore {
  timers: TimerItem[];
  addTimer: (id: string, label: string, seconds: number) => void;
  removeTimer: (id: string) => void;
  toggleTimer: (id: string) => void;
  tick: (onFinish?: (timer: TimerItem) => void) => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  timers: [],

  addTimer: (id, label, seconds) =>
    set((state) => {
      if (state.timers.find((t) => t.id === id)) return state;
      const newTimer: TimerItem = {
        id,
        label,
        totalSeconds: seconds,
        remainingSeconds: seconds,
        isRunning: true,
      };
      return { timers: [...state.timers, newTimer] };
    }),

  removeTimer: (id) =>
    set((state) => ({
      timers: state.timers.filter((t) => t.id !== id),
    })),

  toggleTimer: (id) =>
    set((state) => ({
      timers: state.timers.map((t) =>
        t.id === id ? { ...t, isRunning: !t.isRunning } : t
      ),
    })),

  tick: (onFinish) =>
    set((state) => {
      const finished: TimerItem[] = [];

      const updated = state.timers.map((t) => {
        if (t.isRunning && t.remainingSeconds > 0) {
          const next = { ...t, remainingSeconds: t.remainingSeconds - 1 };
          if (next.remainingSeconds === 0) {
            finished.push(next);
            return { ...next, isRunning: false };
          }
          return next;
        }
        return t;
      });

      if (finished.length > 0 && onFinish) {
        setTimeout(() => {
          finished.forEach((t) => onFinish(t));
        }, 0);
      }

      return { timers: updated };
    }),
}));