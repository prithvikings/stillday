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
  const loadErrorRef = useRef<Error | null>(null);

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

        // Seed sample habits only on a genuinely new installation.
        // If the initialization marker exists, an empty list is intentional.
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
        loadErrorRef.current = null;
      } catch (error) {
        const normalizedError =
          error instanceof Error
            ? error
            : new Error("Failed to load saved habits.");

        loadErrorRef.current = normalizedError;
        console.error("Failed to initialize habits:", normalizedError);
      } finally {
        if (active) {
          // loading=false means the attempt finished; loadErrorRef still
          // prevents mutations if initialization failed.
          loadingRef.current = false;
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const assertReady = useCallback(() => {
    if (loadingRef.current) {
      throw new Error("Habits are still loading.");
    }

    if (loadErrorRef.current) {
      throw new Error(
        "Saved habits could not be loaded. Restart the app and try again before making changes.",
      );
    }
  }, []);

  // Each operation computes its next state only after earlier writes finish.
  // A failed write rejects that operation but does not permanently poison
  // the queue for subsequent operations.
  const enqueueMutation = useCallback(
    (mutate: (current: Habit[]) => Habit[]) => {
      const operation = writeQueueRef.current.then(async () => {
        assertReady();

        const current = habitsRef.current;
        const next = mutate(current);

        await saveHabits(next);

        habitsRef.current = next;
        setHabits(next);
      });

      writeQueueRef.current = operation.catch((error) => {
        console.error("Failed to save habits:", error);
      });

      return operation;
    },
    [assertReady],
  );

  const addHabit = useCallback(
    async (habit: Habit) => {
      await enqueueMutation((current) => {
        if (current.some((item) => item.id === habit.id)) {
          throw new Error("A habit with this ID already exists.");
        }

        return [...current, habit];
      });
    },
    [enqueueMutation],
  );

  const updateHabit = useCallback(
    async (habit: Habit) => {
      await enqueueMutation((current) => {
        if (!current.some((item) => item.id === habit.id)) {
          throw new Error("Habit not found.");
        }

        return current.map((item) => (item.id === habit.id ? habit : item));
      });
    },
    [enqueueMutation],
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      let didDelete = false;

      await enqueueMutation((current) => {
        if (!current.some((item) => item.id === id)) {
          return current;
        }

        didDelete = true;
        return current.filter((item) => item.id !== id);
      });

      if (!didDelete) return;

      // Only clean completion history after the habit-list save succeeds.
      try {
        await removeHabitCompletions(id);
      } catch (error) {
        console.error(
          "Habit was deleted, but its completion history could not be cleaned up:",
          error,
        );
      }
    },
    [enqueueMutation, removeHabitCompletions],
  );

  const replaceHabits = useCallback(
    async (next: Habit[]) => {
      await enqueueMutation(() => next);
      await AsyncStorage.setItem(INITIALIZED_KEY, "true");
    },
    [enqueueMutation],
  );

  const resetHabits = useCallback(async () => {
    await enqueueMutation(() => []);
    await AsyncStorage.setItem(INITIALIZED_KEY, "true");
  }, [enqueueMutation]);

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
