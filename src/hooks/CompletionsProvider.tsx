import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { getCompletions, saveCompletions } from "../services/storage";

type CompletionsMap = Record<string, string[]>;

type CompletionsContextValue = {
  completions: CompletionsMap;
  loading: boolean;
  toggleCompletion: (habitId: string) => Promise<void>;
  removeHabitCompletions: (habitId: string) => Promise<void>;
  today: string;
};

const CompletionsContext = createContext<CompletionsContextValue | null>(null);

function getTodayKey() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function CompletionsProvider({ children }: { children: ReactNode }) {
  const [completions, setCompletions] = useState<CompletionsMap>({});
  const [loading, setLoading] = useState(true);

  // Keep the latest completion data available to rapid successive updates.
  const completionsRef = useRef<CompletionsMap>({});

  // Keep storage writes in order.
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  // Prevent toggles while the initial data is still loading.
  const loadingRef = useRef(true);

  useEffect(() => {
    let active = true;

    async function loadCompletions() {
      try {
        const stored = await getCompletions();

        if (active) {
          completionsRef.current = stored;
          setCompletions(stored);
        }
      } catch (error) {
        console.error("Failed to load completions:", error);
      } finally {
        if (active) {
          loadingRef.current = false;

          if (active) {
            setLoading(false);
          }
        }
      }
    }

    loadCompletions();

    return () => {
      active = false;
    };
  }, []);

  const toggleCompletion = useCallback(async (habitId: string) => {
    if (loadingRef.current) {
      return;
    }

    const today = getTodayKey();
    const current = completionsRef.current;
    const currentToday = current[today] ?? [];

    const isCompleted = currentToday.includes(habitId);

    const updatedToday = isCompleted
      ? currentToday.filter((id) => id !== habitId)
      : [...currentToday, habitId];

    const next: CompletionsMap = {
      ...current,
      [today]: updatedToday,
    };

    // Update the latest snapshot immediately.
    completionsRef.current = next;
    setCompletions(next);

    // Queue saves so older writes cannot finish after newer writes.
    const saveOperation = saveQueueRef.current.then(async () => {
      await saveCompletions(next);
    });

    // Keep the queue usable even if a save fails.
    saveQueueRef.current = saveOperation.catch((error) => {
      console.error("Failed to save completion:", error);
    });

    await saveOperation;
  }, []);

  const removeHabitCompletions = useCallback(async (habitId: string) => {
    if (loadingRef.current) {
      throw new Error("Completion data is still loading.");
    }

    const current = completionsRef.current;
    const next: CompletionsMap = {};

    for (const [date, habitIds] of Object.entries(current)) {
      const remaining = habitIds.filter((id) => id !== habitId);

      // Keep dates that still contain at least one completion.
      if (remaining.length > 0) {
        next[date] = remaining;
      }
    }

    // Update the shared state immediately.
    completionsRef.current = next;
    setCompletions(next);

    // Queue the save behind any pending completion writes.
    const saveOperation = saveQueueRef.current.then(async () => {
      await saveCompletions(next);
    });

    saveQueueRef.current = saveOperation.catch((error) => {
      console.error("Failed to save completion cleanup:", error);
    });

    await saveOperation;
  }, []);

  return (
    <CompletionsContext.Provider
      value={{
        completions,
        loading,
        toggleCompletion,
        removeHabitCompletions,
        today: getTodayKey(),
      }}
    >
      {children}
    </CompletionsContext.Provider>
  );
}

export function useSharedCompletions() {
  const context = useContext(CompletionsContext);

  if (!context) {
    throw new Error(
      "useSharedCompletions must be used inside CompletionsProvider",
    );
  }

  return context;
}
