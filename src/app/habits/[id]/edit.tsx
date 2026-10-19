import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors } from "../../../constants/theme";
import { useHabits } from "../../../hooks/useHabits";
import type { Habit } from "../../../types/habit";


export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, loading, updateHabit } = useHabits();

  const habit = habits.find((item) => item.id === id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const [reminderEnabled, setReminderEnabled] = useState(false);

  const [reminderTime, setReminderTime] = useState(() => {
    const time = new Date();
    time.setHours(20, 0, 0, 0);
    return time;
  });

  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (!habit) return;

    setTitle(habit.title);
    setDescription(habit.description);
    setReminderEnabled(habit.reminderEnabled ?? false);

    const savedTime = new Date();
    savedTime.setHours(
      habit.reminderHour ?? 20,
      habit.reminderMinute ?? 0,
      0,
      0,
    );

    setReminderTime(savedTime);
  }, [
    habit?.id,
    habit?.title,
    habit?.description,
    habit?.reminderEnabled,
    habit?.reminderHour,
    habit?.reminderMinute,
  ]);

  function openTimePicker() {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: reminderTime,
        mode: "time",
        is24Hour: false,
        onValueChange: (_event, selectedTime) => {
          if (selectedTime) {
            setReminderTime(selectedTime);
          }
        },
      });

      return;
    }

    setShowTimePicker(true);
  }

  async function handleSave() {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!habit) return;

    if (!trimmedTitle) {
      Alert.alert("Give your habit a name", "Enter a name before saving.");
      return;
    }

    if (trimmedTitle.length > 60) {
      Alert.alert("Name too long", "Keep your habit name under 60 characters.");
      return;
    }

    if (saving) return;

    setSaving(true);

    const updatedHabit: Habit = {
      ...habit,
      title: trimmedTitle,
      description: trimmedDescription || "One small step at a time.",
      reminderEnabled,
      reminderHour: reminderTime.getHours(),
      reminderMinute: reminderTime.getMinutes(),
    };

    try {
      await updateHabit(updatedHabit);
      router.back();
    } catch {
      Alert.alert(
        "Couldn't update habit",
        "Your changes couldn't be saved. Please try again.",
      );
    } finally {
      setSaving(false);
    }
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

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F7F5EF]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 48,
          paddingBottom: 40,
        }}
      >
        {/* Back button */}
        <Pressable onPress={() => router.back()} className="self-start py-2">
          <Text className="text-base font-medium text-[#39745F]">← Cancel</Text>
        </Pressable>

        {/* Heading */}
        <Text className="mt-8 text-sm font-medium uppercase tracking-widest text-[#85877D]">
          REFINE YOUR ROUTINE
        </Text>

        <Text className="mt-3 text-3xl font-semibold text-[#26382F]">
          Make it your own.
        </Text>

        <Text className="mt-3 text-base leading-6 text-[#85877D]">
          Small adjustments can help a habit fit your life better.
        </Text>

        {/* Habit name */}
        <View className="mt-9">
          <Text className="mb-3 text-sm font-semibold text-[#26382F]">
            Habit name *
          </Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Read for 10 minutes"
            placeholderTextColor="#A5A69D"
            maxLength={60}
            returnKeyType="next"
            accessibilityLabel="Habit name"
            className="rounded-2xl border border-[#DCD8CC] bg-white px-4 py-4 text-base text-[#26382F]"
          />

          <Text className="mt-2 text-right text-xs text-[#85877D]">
            {title.length}/60
          </Text>
        </View>

        {/* Description */}
        <View className="mt-5">
          <Text className="mb-3 text-sm font-semibold text-[#26382F]">
            Description
            <Text className="font-normal text-[#85877D]"> (optional)</Text>
          </Text>

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Why does this habit matter to you?"
            placeholderTextColor="#A5A69D"
            maxLength={120}
            multiline
            textAlignVertical="top"
            accessibilityLabel="Habit description"
            className="min-h-28 rounded-2xl border border-[#DCD8CC] bg-white px-4 py-4 text-base text-[#26382F]"
          />

          <Text className="mt-2 text-right text-xs text-[#85877D]">
            {description.length}/120
          </Text>
        </View>

        {/* Habit reminder */}
        <View className="mt-8 rounded-3xl border border-[#DCD8CC] bg-white p-5">
          <View className="flex-row items-center justify-between">
            <View className="mr-4 flex-1">
              <Text className="text-base font-semibold text-[#26382F]">
                Habit reminder
              </Text>

              <Text className="mt-1 text-sm leading-5 text-[#85877D]">
                Get a gentle nudge to complete this habit.
              </Text>
            </View>

            <Pressable
              accessibilityRole="switch"
              accessibilityLabel="Enable habit reminder"
              accessibilityState={{ checked: reminderEnabled }}
              onPress={() => setReminderEnabled((enabled) => !enabled)}
              className={`h-8 w-14 justify-center rounded-full px-1 ${
                reminderEnabled ? "bg-[#39745F]" : "bg-[#DCD8CC]"
              }`}
            >
              <View
                className={`h-6 w-6 rounded-full bg-white ${
                  reminderEnabled ? "self-end" : "self-start"
                }`}
              />
            </Pressable>
          </View>

          {reminderEnabled && (
            <View className="mt-5 border-t border-[#DCD8CC] pt-4">
              <Text className="text-sm font-medium text-[#85877D]">
                REMIND ME AT
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choose reminder time"
                onPress={openTimePicker}
                className="mt-3 flex-row items-center justify-between rounded-2xl bg-[#F7F5EF] px-4 py-4"
              >
                <Text className="text-lg font-semibold text-[#26382F]">
                  {reminderTime.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>

                <Text className="text-sm font-semibold text-[#39745F]">
                  Change time →
                </Text>
              </Pressable>

              {/* iOS time picker */}
              {showTimePicker && Platform.OS === "ios" && (
                <View className="mt-3">
                  <DateTimePicker
                    value={reminderTime}
                    mode="time"
                    display="spinner"
                    onValueChange={(_event, selectedTime) => {
                      if (selectedTime) {
                        setReminderTime(selectedTime);
                      }
                    }}
                    onDismiss={() => setShowTimePicker(false)}
                  />

                  <Pressable
                    onPress={() => setShowTimePicker(false)}
                    className="mt-2 items-center rounded-xl bg-[#EAE6DA] py-3"
                  >
                    <Text className="font-semibold text-[#39745F]">Done</Text>
                  </Pressable>
                </View>
              )}

              <Text className="mt-3 text-xs leading-5 text-[#85877D]">
                You can change or disable this reminder whenever you like.
              </Text>
            </View>
          )}
        </View>

        {/* Encouragement card */}
        <View className="mt-8 rounded-2xl bg-[#EAE6DA] p-5">
          <Text className="text-sm font-semibold text-[#294D3C]">
            Progress, not perfection.
          </Text>

          <Text className="mt-2 text-sm leading-5 text-[#6F766B]">
            Your routine doesn't have to be perfect. Make changes that help you
            keep showing up.
          </Text>
        </View>

        {/* Save changes */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          accessibilityRole="button"
          className={`mt-8 items-center rounded-2xl bg-[#39745F] py-4 ${
            saving ? "opacity-60" : ""
          }`}
        >
          <Text className="text-base font-semibold text-white">
            {saving ? "Saving changes..." : "Save changes"}
          </Text>
        </Pressable>

        {/* Cancel */}
        <Pressable
          onPress={() => router.back()}
          disabled={saving}
          className="mt-3 items-center rounded-2xl py-4"
        >
          <Text className="text-base font-semibold text-[#85877D]">Cancel</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
