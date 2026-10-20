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
  replaceCompletions: (next: CompletionsMap) => Promise<void>;
  today: string;
  resetCompletions: () => Promise<void>;
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

  const completionsRef = useRef<CompletionsMap>({});
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const loadingRef = useRef(true);
  const loadErrorRef = useRef<Error | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCompletions() {
      try {
        const stored = await getCompletions();

        if (!active) return;

        completionsRef.current = stored;
        setCompletions(stored);
        loadErrorRef.current = null;
      } catch (error) {
        const normalizedError =
          error instanceof Error
            ? error
            : new Error("Failed to load saved completion data.");

        loadErrorRef.current = normalizedError;
        console.error("Failed to load completions:", normalizedError);
      } finally {
        if (active) {
          // The UI can finish its loading state, but mutation guards below
          // still block changes if the saved data could not be read.
          loadingRef.current = false;
          setLoading(false);
        }
      }
    }

    void loadCompletions();

    return () => {
      active = false;
    };
  }, []);

  const assertReady = useCallback(() => {
    if (loadingRef.current) {
      throw new Error("Completion data is still loading.");
    }

    if (loadErrorRef.current) {
      throw new Error(
        "Saved completion data could not be loaded. Restart the app and try again before making changes.",
      );
    }
  }, []);

  // Serialize each complete read-modify-save operation, not just the storage
  // write. This prevents rapid taps from building updates from stale snapshots.
  const enqueueMutation = useCallback(
    (mutate: (current: CompletionsMap) => CompletionsMap) => {
      const operation = saveQueueRef.current.then(async () => {
        assertReady();

        const current = completionsRef.current;
        const next = mutate(current);

        await saveCompletions(next);

        completionsRef.current = next;
        setCompletions(next);
      });

      // Keep the queue usable after a rejected operation while still returning
      // the original rejection to the caller.
      saveQueueRef.current = operation.catch((error) => {
        console.error("Failed to save completion data:", error);
      });

      return operation;
    },
    [assertReady],
  );

  const toggleCompletion = useCallback(
    async (habitId: string) => {
      await enqueueMutation((current) => {
        const today = getTodayKey();
        const currentToday = current[today] ?? [];
        const isCompleted = currentToday.includes(habitId);

        const updatedToday = isCompleted
          ? currentToday.filter((id) => id !== habitId)
          : [...currentToday, habitId];

        return {
          ...current,
          [today]: updatedToday,
        };
      });
    },
    [enqueueMutation],
  );

  const removeHabitCompletions = useCallback(
    async (habitId: string) => {
      await enqueueMutation((current) => {
        const next: CompletionsMap = {};

        for (const [date, habitIds] of Object.entries(current)) {
          const remaining = habitIds.filter((id) => id !== habitId);

          // Preserve the prior behavior of omitting dates with no completions.
          if (remaining.length > 0) {
            next[date] = remaining;
          }
        }

        return next;
      });
    },
    [enqueueMutation],
  );

  const replaceCompletions = useCallback(
    async (next: CompletionsMap) => {
      const replacement: CompletionsMap = Object.fromEntries(
        Object.entries(next).map(([date, ids]) => [date, [...ids]]),
      );

      await enqueueMutation(() => replacement);
    },
    [enqueueMutation],
  );

  const resetCompletions = useCallback(async () => {
    await enqueueMutation(() => ({}));
  }, [enqueueMutation]);

  return (
    <CompletionsContext.Provider
      value={{
        completions,
        loading,
        toggleCompletion,
        removeHabitCompletions,
        replaceCompletions,
        resetCompletions,
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
