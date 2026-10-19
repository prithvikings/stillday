import { router } from "expo-router";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useCompletions } from "../../hooks/useCompletions";
import { useHabits } from "../../hooks/useHabits";

export default function TodayScreen() {
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
      <View className="flex-1 items-center justify-center bg-[#F7F5EF]">
        <ActivityIndicator size="large" color="#39745F" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#F7F5EF]"
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 64,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text className="text-sm font-medium uppercase tracking-widest text-[#85877D]">
        STILLDAY
      </Text>

      <View className="mt-6">
        <Text className="text-3xl font-semibold text-[#26382F]">
          Make today count.
        </Text>

        <Text className="mt-2 text-base text-[#85877D]">
          Small steps, at your own pace.
        </Text>
      </View>

      {/* Daily progress */}
      <View className="mt-8 rounded-3xl bg-[#294D3C] p-6">
        <Text className="text-sm font-medium text-[#D5E0D5]">
          YOUR DAILY PROGRESS
        </Text>

        <View className="mt-4 flex-row items-end justify-between">
          <Text className="text-4xl font-semibold text-white">
            {completedCount}/{habits.length}
          </Text>

          <Text className="text-sm text-[#D5E0D5]">habits completed</Text>
        </View>

        <View className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
          <View
            className="h-full rounded-full bg-[#DCE8D5]"
            style={{ width: `${progress * 100}%` }}
          />
        </View>

        <Text className="mt-3 text-sm text-[#D5E0D5]">
          {completedCount === habits.length && habits.length > 0
            ? "You've completed everything today. Well done."
            : "Every small action matters."}
        </Text>
      </View>

      {/* Habits heading and add button */}
      <View className="mb-4 mt-9 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-semibold text-[#26382F]">
            Your habits
          </Text>

          <Text className="mt-1 text-sm text-[#85877D]">
            One step at a time.
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/habits/new")}
          accessibilityRole="button"
          className="rounded-full bg-[#EAE6DA] px-4 py-3"
        >
          <Text className="font-semibold text-[#39745F]">+ Add habit</Text>
        </Pressable>
      </View>

      {/* Habit cards */}
      {habits.map((habit) => {
        const isCompleted = completedIds.includes(habit.id);

        return (
          <View
            key={habit.id}
            className="mb-3 flex-row items-center rounded-2xl border border-[#DCD8CC] bg-white p-4"
          >
            {/* Tap the habit details to open its detail screen */}
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
              <Text className="text-base font-semibold text-[#26382F]">
                {habit.title}
              </Text>

              <Text className="mt-1 text-sm text-[#85877D]">
                {habit.description}
              </Text>

              <Text className="mt-2 text-xs font-medium text-[#39745F]">
                View details →
              </Text>
            </Pressable>

            {/* Keep completion separate from navigation */}
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel={`Complete ${habit.title}`}
              accessibilityState={{ checked: isCompleted }}
              onPress={() => toggleCompletion(habit.id)}
              className={`h-7 w-7 items-center justify-center rounded-full border-2 ${
                isCompleted
                  ? "border-[#39745F] bg-[#39745F]"
                  : "border-[#DCD8CC] bg-white"
              }`}
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
        <View className="items-center rounded-2xl border border-[#DCD8CC] p-6">
          <Text className="text-base font-semibold text-[#26382F]">
            A fresh start
          </Text>

          <Text className="mt-2 text-center text-sm text-[#85877D]">
            Add your first habit to begin tracking your day.
          </Text>
        </View>
      )}

      <Text className="mt-5 text-center text-sm text-[#85877D]">
        Progress, not perfection.
      </Text>
    </ScrollView>
  );
}
