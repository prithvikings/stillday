import type { Habit } from "../types/habit";
import { saveCompletions, saveHabits } from "./storage";

type BackupData = {
  habits: Habit[];
  completions: Record<string, string[]>;
};

type StilldayBackup = {
  app: "Stillday";
  version: number;
  exportedAt: string;
  data: BackupData;
};

function isValidBackup(value: unknown): value is StilldayBackup {
  if (!value || typeof value !== "object") {
    return false;
  }

  const backup = value as Record<string, unknown>;

  if (
    backup.app !== "Stillday" ||
    backup.version !== 1 ||
    !backup.data ||
    typeof backup.data !== "object"
  ) {
    return false;
  }

  const data = backup.data as Record<string, unknown>;

  if (!Array.isArray(data.habits)) {
    return false;
  }

  if (
    !data.completions ||
    typeof data.completions !== "object" ||
    Array.isArray(data.completions)
  ) {
    return false;
  }

  const habits = data.habits as unknown[];

  const habitIds = new Set<string>();

  for (const habit of habits) {
    if (!habit || typeof habit !== "object") {
      return false;
    }

    const item = habit as Record<string, unknown>;

    if (
      typeof item.id !== "string" ||
      item.id.trim().length === 0 ||
      typeof item.title !== "string" ||
      typeof item.description !== "string" ||
      typeof item.createdAt !== "string"
    ) {
      return false;
    }

    if (habitIds.has(item.id)) {
      return false;
    }

    habitIds.add(item.id);
  }

  const completions = data.completions as Record<string, unknown>;

  for (const [date, completedIds] of Object.entries(completions)) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Array.isArray(completedIds) ||
      !completedIds.every((id) => typeof id === "string")
    ) {
      return false;
    }

    if (new Set(completedIds).size !== completedIds.length) {
      return false;
    }
  }

  return true;
}

export function parseBackup(json: string): StilldayBackup {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("This file isn't valid JSON.");
  }

  if (!isValidBackup(parsed)) {
    throw new Error(
      "This file isn't a valid Stillday backup or uses an unsupported version.",
    );
  }

  return parsed;
}

export async function importBackup(json: string): Promise<void> {
  const backup = parseBackup(json);

  // Save the existing data so we can attempt a rollback if importing fails.
  const { getHabits, getCompletions } = await import("./storage");

  const previousHabits = await getHabits();
  const previousCompletions = await getCompletions();

  try {
    await saveHabits(backup.data.habits);

    await saveCompletions(backup.data.completions);
  } catch (error) {
    // Best-effort rollback to the previous data.
    try {
      await saveHabits(previousHabits);
      await saveCompletions(previousCompletions);
    } catch (rollbackError) {
      console.error("Failed to restore previous data:", rollbackError);
    }

    throw error;
  }
}
