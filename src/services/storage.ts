import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Habit } from "../types/habit";

const HABITS_KEY = "@stillday/habits";
const COMPLETIONS_KEY = "@stillday/completions";

export async function getHabits(): Promise<Habit[]> {
  try {
    const data = await AsyncStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load habits:", error);
    return [];
  }
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export async function getCompletions(): Promise<Record<string, string[]>> {
  try {
    const data = await AsyncStorage.getItem(COMPLETIONS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to load completions:", error);
    return {};
  }
}

export async function saveCompletions(
  completions: Record<string, string[]>,
): Promise<void> {
  await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
}
