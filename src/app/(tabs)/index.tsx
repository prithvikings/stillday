import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAppTheme } from "../../hooks/ThemeProvider";
import { useCompletions } from "../../hooks/useCompletions";
import { useHabits } from "../../hooks/useHabits";
import { calculateStreaks } from "../../utils/streaks";

export default function TodayScreen() {
  const { colors, isDark } = useAppTheme();
  const { habits, loading: habitsLoading } = useHabits();

  const {
    completions,
    loading: completionsLoading,
    toggleCompletion,
    today,
  } = useCompletions();

  const completedIds = completions[today] ?? [];

  const completedCount = habits.filter((habit) =>
    completedIds.includes(habit.id),
  ).length;

  const progress = habits.length > 0 ? completedCount / habits.length : 0;

  if (habitsLoading || completionsLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 64,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text
        className="text-sm font-medium uppercase tracking-widest"
        style={{ color: colors.textSecondary }}
      >
        STILLDAY
      </Text>

      <View className="mt-6">
        <Text className="text-3xl font-semibold" style={{ color: colors.text }}>
          Make today count.
        </Text>

        <Text
          className="mt-2 text-base"
          style={{ color: colors.textSecondary }}
        >
          Small steps, at your own pace.
        </Text>
      </View>

      {/* Daily progress */}
      <View
        className="mt-8 rounded-3xl p-6"
        style={{
          backgroundColor: isDark ? colors.surface : colors.primaryDark,
        }}
      >
        <Text
          className="text-sm font-medium"
          style={{ color: isDark ? colors.textSecondary : "#D5E0D5" }}
        >
          YOUR DAILY PROGRESS
        </Text>

        <View className="mt-4 flex-row items-end justify-between">
          <Text
            className="text-4xl font-semibold"
            style={{ color: isDark ? colors.text : "#FFFFFF" }}
          >
            {completedCount}/{habits.length}
          </Text>

          <Text
            className="text-sm"
            style={{ color: isDark ? colors.textSecondary : "#D5E0D5" }}
          >
            habits completed
          </Text>
        </View>

        <View
          className="mt-4 h-2 overflow-hidden rounded-full"
          style={{
            backgroundColor: isDark ? colors.border : "#FFFFFF33",
          }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: isDark ? colors.primary : "#DCE8D5",
            }}
          />
        </View>

        <Text
          className="mt-3 text-sm"
          style={{ color: isDark ? colors.textSecondary : "#D5E0D5" }}
        >
          {completedCount === habits.length && habits.length > 0
            ? "You've completed everything today. Well done."
            : "Every small action matters."}
        </Text>
      </View>

      {/* Habits heading and add button */}
      <View className="mb-4 mt-9 flex-row items-center justify-between">
        <View>
          <Text
            className="text-xl font-semibold"
            style={{ color: colors.text }}
          >
            Your habits
          </Text>

          <Text
            className="mt-1 text-sm"
            style={{ color: colors.textSecondary }}
          >
            One step at a time.
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/habits/new")}
          accessibilityRole="button"
          className="rounded-full px-4 py-3"
          style={{ backgroundColor: colors.surface }}
        >
          <Text className="font-semibold" style={{ color: colors.primary }}>
            + Add habit
          </Text>
        </Pressable>
      </View>

      {/* Habit cards */}
      {habits.map((habit) => {
        const isCompleted = completedIds.includes(habit.id);
        const streak = calculateStreaks(habit.id, completions);

        return (
          <View
            key={habit.id}
            className="mb-3 flex-row items-center rounded-2xl border p-4"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
          >
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/habits/[id]",
                  params: { id: habit.id },
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`View details for ${habit.title}`}
              className="mr-3 flex-1 py-1"
            >
              <Text
                className="text-base font-semibold"
                style={{ color: colors.text }}
              >
                {habit.title}
              </Text>

              <Text
                className="mt-1 text-sm"
                style={{ color: colors.textSecondary }}
              >
                {habit.description}
              </Text>

              <View className="mt-2 flex-row items-center">
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.primary }}
                >
                  {streak.currentStreak > 0
                    ? `🔥 ${streak.currentStreak}-day streak`
                    : "Start your streak today"}
                </Text>
              </View>

              <Text
                className="mt-2 text-xs font-medium"
                style={{ color: colors.primary }}
              >
                View details →
              </Text>
            </Pressable>

            {/* Completion stays separate from navigation */}
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel={`Complete ${habit.title}`}
              accessibilityState={{ checked: isCompleted }}
              onPress={() => toggleCompletion(habit.id)}
              className="h-7 w-7 items-center justify-center rounded-full border-2"
              style={{
                borderColor: isCompleted ? colors.primary : colors.border,
                backgroundColor: isCompleted ? colors.primary : colors.card,
              }}
            >
              {isCompleted && (
                <Text className="text-sm font-bold text-white">✓</Text>
              )}
            </Pressable>
          </View>
        );
      })}

      {/* Empty state */}
      {habits.length === 0 && (
        <View
          className="mt-5 items-center rounded-3xl border px-6 py-10"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <View
            className="h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-3xl">🌱</Text>
          </View>

          <Text
            className="mt-5 text-xl font-semibold"
            style={{ color: colors.text }}
          >
            A fresh start.
          </Text>

          <Text
            className="mt-2 text-center text-sm leading-6"
            style={{ color: colors.textSecondary }}
          >
            Small changes make a difference. Choose one habit you'd like to
            build, and start at your own pace.
          </Text>

          <Pressable
            onPress={() => router.push("/habits/new")}
            accessibilityRole="button"
            className="mt-6 w-full items-center rounded-full px-5 py-4"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="font-semibold text-white">
              + Create your first habit
            </Text>
          </Pressable>

          <Text
            className="mt-4 text-center text-xs"
            style={{ color: colors.textSecondary }}
          >
            No pressure. Just one small step.
          </Text>
        </View>
      )}

      <Text
        className="mt-5 text-center text-sm"
        style={{ color: colors.textSecondary }}
      >
        Progress, not perfection.
      </Text>
    </ScrollView>
  );
}
