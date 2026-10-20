import type { Habit } from "../types/habit";
import {
  getCompletions,
  getHabits,
  saveCompletions,
  saveHabits,
} from "./storage";

const BACKUP_VERSION = 1;

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRealDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidHabit(value: unknown): value is Habit {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    value.id.trim().length > 0 &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.createdAt === "string" &&
    value.createdAt.trim().length > 0 &&
    Number.isFinite(Date.parse(value.createdAt))
  );
}

function isValidBackup(value: unknown): value is StilldayBackup {
  if (!isRecord(value)) return false;

  if (
    value.app !== "Stillday" ||
    value.version !== BACKUP_VERSION ||
    typeof value.exportedAt !== "string" ||
    !Number.isFinite(Date.parse(value.exportedAt)) ||
    !isRecord(value.data)
  ) {
    return false;
  }

  const data = value.data;

  if (!Array.isArray(data.habits) || !isRecord(data.completions)) {
    return false;
  }

  const habitIds = new Set<string>();

  for (const habit of data.habits) {
    if (!isValidHabit(habit)) return false;

    if (habitIds.has(habit.id)) return false;
    habitIds.add(habit.id);
  }

  for (const [date, completedIds] of Object.entries(data.completions)) {
    if (
      !isRealDateKey(date) ||
      !Array.isArray(completedIds) ||
      !completedIds.every(
        (id) => typeof id === "string" && id.trim().length > 0,
      )
    ) {
      return false;
    }

    if (new Set(completedIds).size !== completedIds.length) return false;

    // A completion should only reference a habit included in this backup.
    if (!completedIds.every((id) => habitIds.has(id))) return false;
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

  // Read both datasets successfully before writing either one.
  const [previousHabits, previousCompletions] = await Promise.all([
    getHabits(),
    getCompletions(),
  ]);

  try {
    await saveHabits(backup.data.habits);
    await saveCompletions(backup.data.completions);
  } catch (error) {
    // Best-effort rollback. Report rollback failures distinctly so they are
    // not silently confused with a cleanly rejected import.
    const rollbackErrors: unknown[] = [];

    try {
      await saveHabits(previousHabits);
    } catch (rollbackError) {
      rollbackErrors.push(rollbackError);
    }

    try {
      await saveCompletions(previousCompletions);
    } catch (rollbackError) {
      rollbackErrors.push(rollbackError);
    }

    if (rollbackErrors.length > 0) {
      console.error("Backup import failed and rollback was incomplete:", {
        importError: error,
        rollbackErrors,
      });

      throw new Error(
        "Backup import failed, and restoring the previous data was incomplete. Please restart Stillday and verify your data before trying again.",
      );
    }

    throw error;
  }
}
