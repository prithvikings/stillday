import { router } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useCompletions } from "../../hooks/useCompletions";
import { useHabits } from "../../hooks/useHabits";

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getLastSevenDays() {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      date,
      key: getDateKey(date),
      label: date.toLocaleDateString(undefined, {
        weekday: "short",
      }),
    };
  });
}

export default function InsightsScreen() {
  const { habits, loading: habitsLoading } = useHabits();

  const { completions, loading: completionsLoading } = useCompletions();

  const days = useMemo(() => getLastSevenDays(), []);

  const analytics = useMemo(() => {
    const dailyStats = days.map((day) => {
      const completedIds = completions[day.key] ?? [];

      const eligibleHabits = habits.filter(
        (habit) => habit.createdAt.slice(0, 10) <= day.key,
      );

      const completedCount = eligibleHabits.filter((habit) =>
        completedIds.includes(habit.id),
      ).length;

      const total = eligibleHabits.length;
      const rate = total > 0 ? completedCount / total : 0;

      return {
        ...day,
        completedCount,
        total,
        rate,
      };
    });

    const possibleCompletions = dailyStats.reduce(
      (sum, day) => sum + day.total,
      0,
    );

    const totalCompletions = dailyStats.reduce(
      (sum, day) => sum + day.completedCount,
      0,
    );

    const weeklyRate =
      possibleCompletions > 0 ? totalCompletions / possibleCompletions : 0;

    const habitStats = habits.map((habit) => {
      const eligibleDays = days.filter(
        (day) => habit.createdAt.slice(0, 10) <= day.key,
      );

      const completedDays = eligibleDays.filter((day) =>
        (completions[day.key] ?? []).includes(habit.id),
      ).length;

      return {
        ...habit,
        completedDays,
        eligibleDays: eligibleDays.length,
        rate: eligibleDays.length > 0 ? completedDays / eligibleDays.length : 0,
      };
    });

    const bestHabit = [...habitStats]
      .filter((habit) => habit.completedDays > 0)
      .sort((a, b) => {
        if (b.rate !== a.rate) {
          return b.rate - a.rate;
        }

        return b.completedDays - a.completedDays;
      })[0];

    return {
      dailyStats,
      totalCompletions,
      possibleCompletions,
      weeklyRate,
      bestHabit,
    };
  }, [days, habits, completions]);

  if (habitsLoading || completionsLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F7F5EF]">
        <ActivityIndicator size="large" color="#39745F" />
      </View>
    );
  }

  {
    habits.length > 0 && (
      <>
        {/* Keep the existing weekly completion card here */}
        {/* Keep the existing summary cards here */}
        {/* Keep the existing weekly activity chart here */}
        {/* Keep the existing best-performing habit card here */}
      </>
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

      <Text className="mt-6 text-3xl font-semibold text-[#26382F]">
        Look how far you've come.
      </Text>

      <Text className="mt-2 text-base leading-6 text-[#85877D]">
        Small steps add up. Here's your progress over the last seven days.
      </Text>

      {/* Empty state for users without habits */}
      {habits.length === 0 && (
        <View className="mt-8 items-center rounded-3xl border border-[#DCD8CC] bg-white px-6 py-10">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-[#EAE6DA]">
            <Text className="text-3xl">🌱</Text>
          </View>

          <Text className="mt-5 text-center text-xl font-semibold text-[#26382F]">
            Your progress starts here.
          </Text>

          <Text className="mt-2 text-center text-sm leading-6 text-[#85877D]">
            Build a routine, show up at your own pace, and your weekly insights
            will grow along with you.
          </Text>

          <Pressable
            onPress={() => router.push("/habits/new")}
            accessibilityRole="button"
            className="mt-6 w-full items-center rounded-full bg-[#39745F] px-5 py-4"
          >
            <Text className="font-semibold text-white">
              + Create your first habit
            </Text>
          </Pressable>
        </View>
      )}

      {/* Weekly completion card */}
      <View className="mt-8 rounded-3xl bg-[#294D3C] p-6">
        <Text className="text-sm font-medium text-[#D5E0D5]">
          WEEKLY COMPLETION RATE
        </Text>

        <Text className="mt-3 text-5xl font-semibold text-white">
          {Math.round(analytics.weeklyRate * 100)}%
        </Text>

        <View className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
          <View
            className="h-full rounded-full bg-[#DCE8D5]"
            style={{
              width: `${analytics.weeklyRate * 100}%`,
            }}
          />
        </View>

        <Text className="mt-3 text-sm leading-5 text-[#D5E0D5]">
          {analytics.totalCompletions} of {analytics.possibleCompletions}{" "}
          possible habit completions across the last seven days.
        </Text>
      </View>

      {/* Summary cards */}
      <View className="mt-5 flex-row">
        <View className="mr-2 flex-1 rounded-2xl border border-[#DCD8CC] bg-white p-4">
          <Text className="text-sm text-[#85877D]">Active habits</Text>

          <Text className="mt-2 text-3xl font-semibold text-[#26382F]">
            {habits.length}
          </Text>

          <Text className="mt-1 text-xs text-[#85877D]">
            Your current routines
          </Text>
        </View>

        <View className="ml-2 flex-1 rounded-2xl border border-[#DCD8CC] bg-white p-4">
          <Text className="text-sm text-[#85877D]">Completions</Text>

          <Text className="mt-2 text-3xl font-semibold text-[#26382F]">
            {analytics.totalCompletions}
          </Text>

          <Text className="mt-1 text-xs text-[#85877D]">
            In the last 7 days
          </Text>
        </View>
      </View>

      {/* Weekly activity chart */}
      <View className="mt-8 rounded-3xl border border-[#DCD8CC] bg-white p-5">
        <Text className="text-lg font-semibold text-[#26382F]">
          Your weekly rhythm
        </Text>

        <Text className="mt-1 text-sm text-[#85877D]">
          Completed habits each day
        </Text>

        <View className="mt-6 flex-row items-end justify-between">
          {analytics.dailyStats.map((day) => {
            const barHeight =
              day.total > 0
                ? Math.max(day.rate * 120, day.completedCount > 0 ? 8 : 4)
                : 4;

            return (
              <View key={day.key} className="flex-1 items-center">
                <Text className="mb-2 text-xs font-medium text-[#39745F]">
                  {day.completedCount}
                </Text>

                <View
                  className="w-6 justify-end overflow-hidden rounded-full bg-[#EAE6DA]"
                  style={{ height: 120 }}
                >
                  <View
                    className="w-full rounded-full bg-[#39745F]"
                    style={{ height: barHeight }}
                  />
                </View>

                <Text className="mt-3 text-xs text-[#85877D]">{day.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Best-performing habit */}
      <View className="mt-6 rounded-3xl bg-[#EAE6DA] p-5">
        <Text className="text-sm font-medium uppercase tracking-widest text-[#6F766B]">
          A LITTLE RECOGNITION
        </Text>

        {analytics.bestHabit ? (
          <>
            <Text className="mt-3 text-xl font-semibold text-[#294D3C]">
              {analytics.bestHabit.title}
            </Text>

            <Text className="mt-2 text-sm leading-5 text-[#6F766B]">
              Completed on {analytics.bestHabit.completedDays} of{" "}
              {analytics.bestHabit.eligibleDays} eligible{" "}
              {analytics.bestHabit.eligibleDays === 1 ? "day" : "days"}. Keep
              finding your own rhythm.
            </Text>

            <View className="mt-4 flex-row items-center justify-between">
              <Text className="text-sm text-[#6F766B]">Weekly consistency</Text>

              <Text className="text-base font-semibold text-[#294D3C]">
                {Math.round(analytics.bestHabit.rate * 100)}%
              </Text>
            </View>
          </>
        ) : (
          <Text className="mt-3 text-sm leading-6 text-[#6F766B]">
            Create your first habit to start discovering your patterns.
          </Text>
        )}
      </View>

      {/* Encouragement */}
      <View className="mt-6 items-center px-4">
        <Text className="text-center text-base font-semibold text-[#26382F]">
          Progress, not perfection.
        </Text>

        <Text className="mt-2 text-center text-sm leading-5 text-[#85877D]">
          Every completed habit is a small promise you kept to yourself.
        </Text>
      </View>
    </ScrollView>
  );
}
