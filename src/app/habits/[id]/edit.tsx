import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@react-native-vector-icons/ionicons";
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

import { useAppTheme } from "../../../hooks/ThemeProvider";
import { useHabits } from "../../../hooks/useHabits";
import type { Habit } from "../../../types/habit";

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, loading, updateHabit } = useHabits();
  const { colors, isDark } = useAppTheme();

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
        <Text className="text-xl font-semibold" style={{ color: colors.text }}>
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
          className="mt-6 rounded-full px-6 py-3"
          style={{ backgroundColor: isDark ? colors.primary : "#39745F" }}
        >
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

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 48,
          paddingBottom: 50,
        }}
      >
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          className="self-start flex-row items-center gap-2 py-2"
          accessibilityRole="button"
          accessibilityLabel="Cancel and go back"
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={isDark ? colors.primary : "#39745F"}
          />
          <Text
            className="text-base font-medium"
            style={{ color: isDark ? colors.primary : "#39745F" }}
          >
            Cancel
          </Text>
        </Pressable>

        {/* Heading */}
        <Text
          className="mt-8 text-sm font-medium uppercase tracking-widest"
          style={{ color: isDark ? colors.textSecondary : "#85877D" }}
        >
          REFINE YOUR ROUTINE
        </Text>

        <View className="mt-3 flex-row items-center gap-3">
          <View
            className="h-11 w-11 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: isDark ? colors.surface : "#EAE6DA",
            }}
          >
            <Ionicons
              name="leaf-outline"
              size={23}
              color={isDark ? colors.primary : "#39745F"}
            />
          </View>
          <Text
            className="flex-1 text-3xl font-semibold"
            style={{ color: colors.text }}
          >
            Make it your own.
          </Text>
        </View>

        <Text
          className="mt-3 text-base leading-6"
          style={{ color: isDark ? colors.textSecondary : "#85877D" }}
        >
          Small adjustments can help a habit fit your life better.
        </Text>

        {/* Habit name */}
        <View className="mt-9">
          <Text
            className="mb-3 text-sm font-semibold"
            style={{ color: colors.text }}
          >
            Habit name *
          </Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Read for 10 minutes"
            placeholderTextColor={isDark ? colors.textSecondary : "#A5A69D"}
            maxLength={60}
            returnKeyType="next"
            accessibilityLabel="Habit name"
            className="rounded-2xl border px-4 py-4 text-base"
            style={{
              backgroundColor: isDark ? colors.card : "#FFFFFF",
              borderColor: colors.border,
              color: colors.text,
            }}
          />

          <Text
            className="mt-2 text-right text-xs"
            style={{ color: isDark ? colors.textSecondary : "#85877D" }}
          >
            {title.length}/60
          </Text>
        </View>

        {/* Description */}
        <View className="mt-5">
          <Text
            className="mb-3 text-sm font-semibold"
            style={{ color: colors.text }}
          >
            Description
            <Text
              className="font-normal"
              style={{ color: isDark ? colors.textSecondary : "#85877D" }}
            >
              {" "}
              (optional)
            </Text>
          </Text>

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Why does this habit matter to you?"
            placeholderTextColor={isDark ? colors.textSecondary : "#A5A69D"}
            maxLength={120}
            multiline
            textAlignVertical="top"
            accessibilityLabel="Habit description"
            className="min-h-28 rounded-2xl border px-4 py-4 text-base"
            style={{
              backgroundColor: isDark ? colors.card : "#FFFFFF",
              borderColor: colors.border,
              color: colors.text,
            }}
          />

          <Text
            className="mt-2 text-right text-xs"
            style={{ color: isDark ? colors.textSecondary : "#85877D" }}
          >
            {description.length}/120
          </Text>
        </View>

        {/* Habit reminder */}
        <View
          className="mt-8 rounded-3xl border p-5"
          style={{
            backgroundColor: isDark ? colors.card : "#FFFFFF",
            borderColor: colors.border,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="mr-4 flex-1">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="notifications-outline"
                  size={19}
                  color={isDark ? colors.primary : "#39745F"}
                />
                <Text
                  className="text-base font-semibold"
                  style={{ color: colors.text }}
                >
                  Habit reminder
                </Text>
              </View>

              <Text
                className="mt-1 text-sm leading-5"
                style={{ color: isDark ? colors.textSecondary : "#85877D" }}
              >
                Get a gentle nudge to complete this habit.
              </Text>
            </View>

            <Pressable
              accessibilityRole="switch"
              accessibilityLabel="Enable habit reminder"
              accessibilityState={{ checked: reminderEnabled }}
              onPress={() => setReminderEnabled((enabled) => !enabled)}
              className="h-8 w-14 justify-center rounded-full px-1"
              style={{
                backgroundColor: reminderEnabled
                  ? isDark
                    ? colors.primary
                    : "#39745F"
                  : colors.border,
              }}
            >
              <View
                className={`h-6 w-6 rounded-full bg-white ${
                  reminderEnabled ? "self-end" : "self-start"
                }`}
              />
            </Pressable>
          </View>

          {reminderEnabled && (
            <View
              className="mt-5 border-t pt-4"
              style={{ borderColor: colors.border }}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: isDark ? colors.textSecondary : "#85877D" }}
              >
                REMIND ME AT
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choose reminder time"
                onPress={openTimePicker}
                className="mt-3 flex-row items-center justify-between rounded-2xl px-4 py-4"
                style={{
                  backgroundColor: isDark ? colors.surface : "#F7F5EF",
                }}
              >
                <Text
                  className="text-lg font-semibold"
                  style={{ color: colors.text }}
                >
                  {reminderTime.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>

                <View className="flex-row items-center gap-1">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: isDark ? colors.primary : "#39745F" }}
                  >
                    Change time
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={isDark ? colors.primary : "#39745F"}
                  />
                </View>
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
                    themeVariant={isDark ? "dark" : "light"}
                  />

                  <Pressable
                    onPress={() => setShowTimePicker(false)}
                    className="mt-2 items-center rounded-xl py-3"
                    style={{
                      backgroundColor: isDark ? colors.muted : "#EAE6DA",
                    }}
                  >
                    <Text
                      className="font-semibold"
                      style={{ color: isDark ? colors.primary : "#39745F" }}
                    >
                      Done
                    </Text>
                  </Pressable>
                </View>
              )}

              <Text
                className="mt-3 text-xs leading-5"
                style={{ color: isDark ? colors.textSecondary : "#85877D" }}
              >
                You can change or disable this reminder whenever you like.
              </Text>
            </View>
          )}
        </View>

        {/* Encouragement card */}
        <View
          className="mt-8 rounded-2xl p-5"
          style={{
            backgroundColor: isDark ? colors.surface : "#EAE6DA",
            borderWidth: isDark ? 1 : 0,
            borderColor: colors.border,
          }}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons
              name="sparkles-outline"
              size={18}
              color={isDark ? colors.primaryDark : "#294D3C"}
            />
            <Text
              className="text-sm font-semibold"
              style={{ color: isDark ? colors.primaryDark : "#294D3C" }}
            >
              Progress, not perfection.
            </Text>
          </View>

          <Text
            className="mt-2 text-sm leading-5"
            style={{ color: isDark ? colors.textSecondary : "#6F766B" }}
          >
            Your routine doesn't have to be perfect. Make changes that help you
            keep showing up.
          </Text>
        </View>

        {/* Save changes */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          accessibilityRole="button"
          className={`mt-8 flex-row items-center justify-center gap-2 rounded-2xl py-4 ${
            saving ? "opacity-60" : ""
          }`}
          style={{ backgroundColor: isDark ? colors.primary : "#39745F" }}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={isDark ? "#171E1A" : "#FFFFFF"}
          />
          <Text
            className="text-base font-semibold"
            style={{ color: isDark ? "#171E1A" : "#FFFFFF" }}
          >
            {saving ? "Saving changes..." : "Save changes"}
          </Text>
        </Pressable>

        {/* Cancel */}
        <Pressable
          onPress={() => router.back()}
          disabled={saving}
          className="mt-3 flex-row items-center justify-center gap-2 rounded-2xl py-4"
        >
          <Ionicons
            name="close-circle-outline"
            size={19}
            color={isDark ? colors.textSecondary : "#85877D"}
          />
          <Text
            className="text-base font-semibold"
            style={{ color: isDark ? colors.textSecondary : "#85877D" }}
          >
            Cancel
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
