export type Habit = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  color?: string;

  // Optional reminder settings for this habit.
  reminderEnabled?: boolean;
  reminderHour?: number;
  reminderMinute?: number;
  reminderNotificationId?: string;
};
