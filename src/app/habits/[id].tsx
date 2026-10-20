import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useAppTheme } from "../../hooks/ThemeProvider";
import { useCompletions } from "../../hooks/useCompletions";
import { useHabits } from "../../hooks/useHabits";
import { calculateStreaks } from "../../utils/streaks";

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, loading, deleteHabit } = useHabits();
  const { completions } = useCompletions();
  const { colors, isDark } = useAppTheme();
  const [deleting, setDeleting] = useState(false);

  const habit = habits.find((item) => item.id === id);
  const streaks = habit ? calculateStreaks(habit.id, completions) : null;

  async function handleDelete() {
    if (!habit || deleting) return;

    Alert.alert(
      "Delete this habit?",
      `"${habit.title}" will be permanently removed from your habits.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);

            try {
              await deleteHabit(habit.id);
              router.replace("/(tabs)");
            } catch {
              Alert.alert("Couldn't delete habit", "Please try again.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? colors.primary : "#39745F"}
        />
      </View>
    );
  }

  if (!habit) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.background }}
      >
        <Ionicons
          name="leaf-outline"
          size={36}
          color={isDark ? colors.textSecondary : "#85877D"}
        />
        <Text
          className="mt-3 text-xl font-semibold"
          style={{ color: colors.text }}
        >
          Habit not found
        </Text>

        <Text
          className="mt-2 text-center text-base"
          style={{ color: isDark ? colors.textSecondary : "#85877D" }}
        >
          This habit may have been deleted.
        </Text>

        <Pressable
          onPress={() => router.replace("/(tabs)")}
          className="mt-6 flex-row items-center rounded-full px-6 py-3"
          style={{ backgroundColor: isDark ? colors.primary : "#39745F" }}
        >
          <Ionicons
            name="arrow-back-outline"
            size={17}
            color={isDark ? "#171E1A" : "#FFFFFF"}
            style={{ marginRight: 7 }}
          />
          <Text
            className="font-semibold"
            style={{ color: isDark ? "#171E1A" : "#FFFFFF" }}
          >
            Back to Today
          </Text>
        </Pressable>
      </View>
    );
  }

  const createdDate = new Date(habit.createdAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 64,
        paddingBottom: 40,
      }}
    >
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        className="self-start flex-row items-center py-2"
      >
        <Ionicons
          name="arrow-back-outline"
          size={18}
          color={isDark ? colors.primary : "#39745F"}
          style={{ marginRight: 6 }}
        />
        <Text
          className="text-base font-medium"
          style={{ color: isDark ? colors.primary : "#39745F" }}
        >
          Back
        </Text>
      </Pressable>

      <View className="mt-10 flex-row items-center">
        <Ionicons
          name="leaf-outline"
          size={17}
          color={isDark ? colors.textSecondary : "#85877D"}
          style={{ marginRight: 8 }}
        />
        <Text
          className="text-sm font-medium uppercase tracking-widest"
          style={{ color: isDark ? colors.textSecondary : "#85877D" }}
        >
          YOUR HABIT
        </Text>
      </View>

      <Text
        className="mt-3 text-3xl font-semibold leading-10"
        style={{ color: colors.text }}
      >
        {habit.title}
      </Text>

      <Text
        className="mt-4 text-base leading-7"
        style={{ color: isDark ? colors.textSecondary : "#85877D" }}
      >
        {habit.description || "One small step at a time."}
      </Text>

      {streaks && (
        <View
          className="mt-8 rounded-3xl border p-5"
          style={{
            backgroundColor: isDark ? colors.card : "#FFFFFF",
            borderColor: colors.border,
          }}
        >
          <View className="flex-row items-center">
            <Ionicons
              name="trending-up-outline"
              size={17}
              color={isDark ? colors.textSecondary : "#85877D"}
              style={{ marginRight: 7 }}
            />
            <Text
              className="text-sm font-medium uppercase tracking-widest"
              style={{ color: isDark ? colors.textSecondary : "#85877D" }}
            >
              YOUR PROGRESS
            </Text>
          </View>

          <View className="mt-5 flex-row">
            <View className="flex-1">
              <View className="flex-row items-center">
                <Ionicons
                  name="flame-outline"
                  size={15}
                  color={isDark ? colors.primary : "#39745F"}
                  style={{ marginRight: 5 }}
                />
                <Text
                  className="text-sm font-medium"
                  style={{ color: isDark ? colors.textSecondary : "#85877D" }}
                >
                  Current streak
                </Text>
              </View>
              <Text
                className="mt-2 text-3xl font-semibold"
                style={{ color: isDark ? colors.primary : "#39745F" }}
              >
                {streaks.currentStreak}
              </Text>
              <Text
                className="mt-1 text-xs"
                style={{ color: isDark ? colors.textSecondary : "#85877D" }}
              >
                {streaks.currentStreak === 1 ? "day" : "days"}
              </Text>
            </View>

            <View
              className="mx-3 w-px"
              style={{ backgroundColor: colors.border }}
            />

            <View className="flex-1">
              <View className="flex-row items-center">
                <Ionicons
                  name="trophy-outline"
                  size={15}
                  color={isDark ? colors.primary : "#39745F"}
                  style={{ marginRight: 5 }}
                />
                <Text
                  className="text-sm font-medium"
                  style={{ color: isDark ? colors.textSecondary : "#85877D" }}
                >
                  Best streak
                </Text>
              </View>
              <Text
                className="mt-2 text-3xl font-semibold"
                style={{ color: isDark ? colors.primary : "#39745F" }}
              >
                {streaks.bestStreak}
              </Text>
              <Text
                className="mt-1 text-xs"
                style={{ color: isDark ? colors.textSecondary : "#85877D" }}
              >
                {streaks.bestStreak === 1 ? "day" : "days"}
              </Text>
            </View>
          </View>

          <View
            className="mt-5 border-t pt-4"
            style={{ borderColor: colors.border }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={isDark ? colors.textSecondary : "#85877D"}
                  style={{ marginRight: 7 }}
                />
                <Text
                  className="text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  Last 7 days
                </Text>
              </View>

              <Text
                className="text-sm font-semibold"
                style={{ color: isDark ? colors.primary : "#39745F" }}
              >
                {streaks.completedDaysThisWeek}/7 days
              </Text>
            </View>

            <View
              className="mt-3 h-2 overflow-hidden rounded-full"
              style={{ backgroundColor: isDark ? colors.muted : "#EAE6DA" }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  width: `${(streaks.completedDaysThisWeek / 7) * 100}%`,
                  backgroundColor: isDark ? colors.primary : "#39745F",
                }}
              />
            </View>
          </View>
        </View>
      )}

      <View
        className="mt-8 rounded-3xl p-6"
        style={{
          backgroundColor: isDark ? colors.surface : "#EAE6DA",
          borderWidth: isDark ? 1 : 0,
          borderColor: colors.border,
        }}
      >
        <View className="flex-row items-center">
          <Ionicons
            name="calendar-clear-outline"
            size={16}
            color={isDark ? colors.textSecondary : "#85877D"}
            style={{ marginRight: 7 }}
          />
          <Text
            className="text-sm font-medium"
            style={{ color: isDark ? colors.textSecondary : "#85877D" }}
          >
            CREATED ON
          </Text>
        </View>

        <Text
          className="mt-2 text-lg font-semibold"
          style={{ color: colors.text }}
        >
          {createdDate}
        </Text>

        <View
          className="my-5 h-px"
          style={{ backgroundColor: colors.border }}
        />

        <Text
          className="text-sm leading-6"
          style={{ color: isDark ? colors.textSecondary : "#6F766B" }}
        >
          Small actions, repeated over time, can become meaningful routines.
          Focus on showing up rather than being perfect.
        </Text>
      </View>

      <Pressable
        onPress={() =>
          router.push({
            pathname: "/habits/[id]/edit",
            params: { id: habit.id },
          })
        }
        accessibilityRole="button"
        className="mt-8 flex-row items-center justify-center rounded-2xl py-4"
        style={{ backgroundColor: isDark ? colors.primary : "#39745F" }}
      >
        <Ionicons
          name="create-outline"
          size={18}
          color={isDark ? "#171E1A" : "#FFFFFF"}
          style={{ marginRight: 8 }}
        />
        <Text
          className="text-base font-semibold"
          style={{ color: isDark ? "#171E1A" : "#FFFFFF" }}
        >
          Edit habit
        </Text>
      </Pressable>

      <Pressable
        onPress={handleDelete}
        disabled={deleting}
        accessibilityRole="button"
        className="mt-4 flex-row items-center justify-center rounded-2xl border py-4"
        style={{
          borderColor: isDark ? `${colors.danger}99` : "#DCD8CC",
          backgroundColor: isDark ? `${colors.danger}0D` : "transparent",
          opacity: deleting ? 0.7 : 1,
        }}
      >
        {deleting ? (
          <ActivityIndicator
            size="small"
            color={isDark ? colors.danger : "#A4473D"}
            style={{ marginRight: 8 }}
          />
        ) : (
          <Ionicons
            name="trash-outline"
            size={18}
            color={isDark ? colors.danger : "#A4473D"}
            style={{ marginRight: 8 }}
          />
        )}
        <Text
          className="text-base font-semibold"
          style={{ color: isDark ? colors.danger : "#A4473D" }}
        >
          {deleting ? "Deleting..." : "Delete habit"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
