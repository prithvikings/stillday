import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getHabits, saveHabits } from "../services/storage";
import type { Habit } from "../types/habit";
import { useSharedCompletions } from "./CompletionsProvider";

const INITIALIZED_KEY = "@stillday/habits_initialized";

type HabitsContextValue = {
  habits: Habit[];
  loading: boolean;
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  replaceHabits: (next: Habit[]) => Promise<void>;
  resetHabits: () => Promise<void>;
};

const HabitsContext = createContext<HabitsContextValue | null>(null);

const initialHabits: Habit[] = [
  {
    id: "habit-water",
    title: "Drink water",
    description: "Stay hydrated",
    createdAt: "2026-10-19T00:00:00.000Z",
  },
  {
    id: "habit-reading",
    title: "Read for 10 minutes",
    description: "A little every day",
    createdAt: "2026-10-19T00:00:00.000Z",
  },
  {
    id: "habit-walk",
    title: "Go for a walk",
    description: "Move at your own pace",
    createdAt: "2026-10-19T00:00:00.000Z",
  },
];

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const habitsRef = useRef<Habit[]>([]);
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());
  const loadingRef = useRef(true);

  const { removeHabitCompletions } = useSharedCompletions();

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [stored, initialized] = await Promise.all([
          getHabits(),
          AsyncStorage.getItem(INITIALIZED_KEY),
        ]);

        if (!active) return;

        let next = stored;

        if (initialized === null) {
          if (stored.length === 0) {
            await saveHabits(initialHabits);
            next = initialHabits;
          }

          await AsyncStorage.setItem(INITIALIZED_KEY, "true");
        }

        if (!active) return;

        habitsRef.current = next;
        setHabits(next);
      } catch (error) {
        console.error("Failed to load habits:", error);
      } finally {
        if (active) {
          loadingRef.current = false;
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const enqueueSave = useCallback((next: Habit[]) => {
    const saveOperation = writeQueueRef.current.then(() => saveHabits(next));

    // Keep the queue usable even if a previous save fails.
    writeQueueRef.current = saveOperation.catch((error) => {
      console.error("Failed to save habits:", error);
    });

    return saveOperation;
  }, []);

  const addHabit = useCallback(
    async (habit: Habit) => {
      if (loadingRef.current) {
        throw new Error("Habits are still loading.");
      }

      const current = habitsRef.current;

      if (current.some((item) => item.id === habit.id)) {
        throw new Error("A habit with this ID already exists.");
      }

      const next = [...current, habit];

      // Save first so a failed write doesn't change the visible state.
      await enqueueSave(next);

      habitsRef.current = next;
      setHabits(next);
    },
    [enqueueSave],
  );

  const updateHabit = useCallback(
    async (habit: Habit) => {
      if (loadingRef.current) {
        throw new Error("Habits are still loading.");
      }

      const current = habitsRef.current;

      if (!current.some((item) => item.id === habit.id)) {
        throw new Error("Habit not found.");
      }

      const next = current.map((item) => (item.id === habit.id ? habit : item));

      await enqueueSave(next);

      habitsRef.current = next;
      setHabits(next);
    },
    [enqueueSave],
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      if (loadingRef.current) {
        throw new Error("Habits are still loading.");
      }

      const current = habitsRef.current;

      if (!current.some((item) => item.id === id)) {
        return;
      }

      // Save the updated habit list first.
      const next = current.filter((item) => item.id !== id);
      await enqueueSave(next);

      habitsRef.current = next;
      setHabits(next);

      // Clean up history after the habit deletion succeeds.
      try {
        await removeHabitCompletions(id);
      } catch (error) {
        console.error(
          "Habit was deleted, but its completion history could not be cleaned up:",
          error,
        );
      }
    },
    [enqueueSave, removeHabitCompletions],
  );

  const replaceHabits = useCallback(
    async (next: Habit[]) => {
      if (loadingRef.current) {
        throw new Error("Habits are still loading.");
      }

      const saveOperation = enqueueSave(next);

      await saveOperation;

      habitsRef.current = next;
      setHabits(next);

      await AsyncStorage.setItem(INITIALIZED_KEY, "true");
    },
    [enqueueSave],
  );

  const resetHabits = useCallback(async () => {
    if (loadingRef.current) {
      throw new Error("Habits are still loading.");
    }

    const emptyHabits: Habit[] = [];

    await enqueueSave(emptyHabits);

    habitsRef.current = emptyHabits;
    setHabits(emptyHabits);

    await AsyncStorage.setItem(INITIALIZED_KEY, "true");
  }, [enqueueSave]);
  return (
    <HabitsContext.Provider
      value={{
        habits,
        loading,
        addHabit,
        updateHabit,
        deleteHabit,
        replaceHabits,
        resetHabits,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);

  if (!context) {
    throw new Error("useHabits must be used inside HabitsProvider");
  }

  return context;
}
