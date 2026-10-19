export type StreakStats = {
  currentStreak: number;
  bestStreak: number;
  completedDaysThisWeek: number;
};

type CompletionHistory = Record<string, string[]>;

/**
 * Converts a local calendar date into a stable YYYY-MM-DD key.
 */
export function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Moves a date by a number of calendar days.
 * Using calendar dates avoids daylight-saving-time arithmetic issues.
 */
function shiftDate(dateKey: string, amount: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);

  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);

  return getDateKey(date);
}

/**
 * Returns true when the specified habit was completed on a date.
 */
function wasCompleted(
  history: CompletionHistory,
  habitId: string,
  dateKey: string,
): boolean {
  return history[dateKey]?.includes(habitId) ?? false;
}

/**
 * Calculates the current streak, best streak, and seven-day consistency
 * for one habit.
 *
 * The optional referenceDate makes the function easier to test.
 */
export function calculateStreaks(
  habitId: string,
  history: CompletionHistory,
  referenceDate: Date = new Date(),
): StreakStats {
  const today = getDateKey(referenceDate);
  const yesterday = shiftDate(today, -1);

  // Calculate the current streak.
  let currentStreak = 0;

  let cursor = wasCompleted(history, habitId, today) ? today : yesterday;

  while (wasCompleted(history, habitId, cursor)) {
    currentStreak += 1;
    cursor = shiftDate(cursor, -1);
  }

  // Calculate the best streak without counting future dates.
  const completedDates = Object.entries(history)
    .filter(([dateKey, habitIds]) => {
      return dateKey <= today && habitIds.includes(habitId);
    })
    .map(([dateKey]) => dateKey)
    .sort();

  let bestStreak = 0;
  let runningStreak = 0;
  let previousDate: string | null = null;

  for (const dateKey of completedDates) {
    if (dateKey === previousDate) {
      continue;
    }

    if (previousDate !== null && shiftDate(previousDate, 1) === dateKey) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    bestStreak = Math.max(bestStreak, runningStreak);
    previousDate = dateKey;
  }

  // Count completed days in the last seven calendar days.
  let completedDaysThisWeek = 0;

  for (let daysAgo = 0; daysAgo < 7; daysAgo += 1) {
    const dateKey = shiftDate(today, -daysAgo);

    if (wasCompleted(history, habitId, dateKey)) {
      completedDaysThisWeek += 1;
    }
  }

  return {
    currentStreak,
    bestStreak,
    completedDaysThisWeek,
  };
}
