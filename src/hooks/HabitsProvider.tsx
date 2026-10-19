import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { getHabits, saveHabits } from "../services/storage";
import type { Habit } from "../types/habit";

type HabitsContextValue = {
  habits: Habit[];
  loading: boolean;
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
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

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const stored = await getHabits();

        if (!active) return;

        if (stored.length > 0) {
          setHabits(stored);
        } else {
          await saveHabits(initialHabits);
          if (active) setHabits(initialHabits);
        }
      } catch (error) {
        console.error("Failed to load habits:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const addHabit = useCallback(
    async (habit: Habit) => {
      const next = [...habits, habit];
      await saveHabits(next);
      setHabits(next);
    },
    [habits],
  );

  const updateHabit = useCallback(
    async (habit: Habit) => {
      const next = habits.map((item) => (item.id === habit.id ? habit : item));
      await saveHabits(next);
      setHabits(next);
    },
    [habits],
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      const next = habits.filter((habit) => habit.id !== id);
      await saveHabits(next);
      setHabits(next);
    },
    [habits],
  );

  return (
    <HabitsContext.Provider
      value={{ habits, loading, addHabit, updateHabit, deleteHabit }}
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
