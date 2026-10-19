import { useCallback, useEffect, useState } from "react";
import { getCompletions, saveCompletions } from "../services/storage";

function getTodayKey() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function useCompletions() {
  const [completions, setCompletions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getCompletions()
      .then((stored) => {
        if (active) setCompletions(stored);
      })
      .catch((error) => {
        console.error("Failed to load completions:", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const toggleCompletion = useCallback(
    async (habitId: string) => {
      const today = getTodayKey();

      const current = completions[today] ?? [];
      const isCompleted = current.includes(habitId);

      const updatedToday = isCompleted
        ? current.filter((id) => id !== habitId)
        : [...current, habitId];

      const next = {
        ...completions,
        [today]: updatedToday,
      };

      setCompletions(next);

      try {
        await saveCompletions(next);
      } catch (error) {
        console.error("Failed to save completion:", error);
        setCompletions(completions);
      }
    },
    [completions],
  );

  return {
    completions,
    loading,
    toggleCompletion,
    today: getTodayKey(),
  };
}
