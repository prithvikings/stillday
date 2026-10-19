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

import { colors } from "../../constants/theme";
import { useHabits } from "../../hooks/useHabits";

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, loading, deleteHabit } = useHabits();
  const [deleting, setDeleting] = useState(false);

  const habit = habits.find((item) => item.id === id);

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
      <View className="flex-1 items-center justify-center bg-[#F7F5EF]">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!habit) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F7F5EF] px-6">
        <Text className="text-xl font-semibold text-[#26382F]">
          Habit not found
        </Text>

        <Text className="mt-2 text-center text-base text-[#85877D]">
          This habit may have been deleted.
        </Text>

        <Pressable
          onPress={() => router.replace("/(tabs)")}
          className="mt-6 rounded-full bg-[#39745F] px-6 py-3"
        >
          <Text className="font-semibold text-white">Back to Today</Text>
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
      className="flex-1 bg-[#F7F5EF]"
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 64,
        paddingBottom: 40,
      }}
    >
      <Pressable onPress={() => router.back()} className="self-start py-2">
        <Text className="text-base font-medium text-[#39745F]">← Back</Text>
      </Pressable>

      <Text className="mt-10 text-sm font-medium uppercase tracking-widest text-[#85877D]">
        YOUR HABIT
      </Text>

      <Text className="mt-3 text-3xl font-semibold leading-10 text-[#26382F]">
        {habit.title}
      </Text>

      <Text className="mt-4 text-base leading-7 text-[#85877D]">
        {habit.description || "One small step at a time."}
      </Text>

      <View className="mt-8 rounded-3xl bg-[#EAE6DA] p-6">
        <Text className="text-sm font-medium text-[#85877D]">CREATED ON</Text>

        <Text className="mt-2 text-lg font-semibold text-[#26382F]">
          {createdDate}
        </Text>

        <View className="my-5 h-px bg-[#DCD8CC]" />

        <Text className="text-sm leading-6 text-[#6F766B]">
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
        className="mt-8 items-center rounded-2xl bg-[#39745F] py-4"
      >
        <Text className="text-base font-semibold text-white">Edit habit</Text>
      </Pressable>

      <Pressable
        onPress={handleDelete}
        disabled={deleting}
        className="mt-4 items-center rounded-2xl border border-[#DCD8CC] py-4"
      >
        <Text className="text-base font-semibold text-[#A4473D]">
          {deleting ? "Deleting..." : "Delete habit"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
