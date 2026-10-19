import { calculateStreaks } from "./streaks";

const today = new Date(2026, 9, 19); // October 19, 2026

const history: Record<string, string[]> = {
  "2026-10-13": ["habit-water"],
  "2026-10-14": ["habit-water"],
  "2026-10-15": ["habit-water"],
  "2026-10-17": ["habit-water"],
  "2026-10-18": ["habit-water"],
};

const result = calculateStreaks("habit-water", history, today);

console.log("Streak test result:", result);
