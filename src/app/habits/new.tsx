import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAppTheme } from "../../hooks/ThemeProvider";
import { useHabits } from "../../hooks/useHabits";
import type { Habit } from "../../types/habit";

export default function NewHabitScreen() {
  const { addHabit } = useHabits();
  const { colors, isDark } = useAppTheme();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

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

    const habit: Habit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: trimmedTitle,
      description: trimmedDescription || "One small step at a time.",
      createdAt: new Date().toISOString(),
    };

    try {
      await addHabit(habit);
      router.back();
    } catch {
      Alert.alert("Couldn't save habit", "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 64,
          paddingBottom: 130,
        }}
        style={{ backgroundColor: colors.background }}
      >
        <Pressable
          onPress={() => router.back()}
          className="self-start flex-row items-center gap-2 py-2"
          accessibilityRole="button"
          accessibilityLabel="Go back"
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
            Back
          </Text>
        </Pressable>

        <Text
          className="mt-8 text-sm font-medium uppercase tracking-widest"
          style={{ color: colors.textSecondary }}
        >
          BUILD A ROUTINE
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
            A little starts here.
          </Text>
        </View>

        <Text
          className="mt-3 text-base leading-6"
          style={{ color: isDark ? colors.textSecondary : "#85877D" }}
        >
          Choose one small action you'd like to make part of your day.
        </Text>

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
              color={isDark ? colors.primary : "#294D3C"}
            />
            <Text
              className="text-sm font-semibold"
              style={{ color: isDark ? colors.primaryDark : "#294D3C" }}
            >
              Keep it achievable
            </Text>
          </View>
          <Text
            className="mt-2 text-sm leading-5"
            style={{ color: isDark ? colors.textSecondary : "#6F766B" }}
          >
            Start with something small enough to do even on a busy day.
            Consistency matters more than perfection.
          </Text>
        </View>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          className={`mt-8 flex-row items-center justify-center gap-2 rounded-2xl py-4 ${
            saving ? "opacity-60" : ""
          }`}
          style={{ backgroundColor: isDark ? colors.primary : "#39745F" }}
          accessibilityRole="button"
          accessibilityLabel="Create habit"
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={isDark ? "#171E1A" : "#FFFFFF"}
          />
          <Text
            className="text-base font-semibold"
            style={{ color: isDark ? "#171E1A" : "#FFFFFF" }}
          >
            {saving ? "Saving..." : "Create habit"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
