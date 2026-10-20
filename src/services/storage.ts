import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Habit } from "../types/habit";

const HABITS_KEY = "@stillday/habits";
const COMPLETIONS_KEY = "@stillday/completions";

export async function getHabits(): Promise<Habit[]> {
  const data = await AsyncStorage.getItem(HABITS_KEY);

  if (data === null) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(data);
  } catch {
    throw new Error("Stored habits data is corrupted or invalid JSON.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Stored habits data must be an array.");
  }

  return parsed as Habit[];
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export async function getCompletions(): Promise<Record<string, string[]>> {
  const data = await AsyncStorage.getItem(COMPLETIONS_KEY);

  if (data === null) {
    return {};
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(data);
  } catch {
    throw new Error("Stored completions data is corrupted or invalid JSON.");
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Stored completions data must be an object.");
  }

  for (const [date, habitIds] of Object.entries(parsed)) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Array.isArray(habitIds) ||
      !habitIds.every((id) => typeof id === "string")
    ) {
      throw new Error("Stored completions data contains invalid entries.");
    }
  }

  return parsed as Record<string, string[]>;
}

export async function saveCompletions(
  completions: Record<string, string[]>,
): Promise<void> {
  await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
}
