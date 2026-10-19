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
import { useHabits } from "../../hooks/useHabits";
import type { Habit } from "../../types/habit";

export default function NewHabitScreen() {
  const { addHabit } = useHabits();

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
      className="flex-1 bg-[#F7F5EF]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 64,
          paddingBottom: 40,
        }}
      >
        <Pressable onPress={() => router.back()} className="self-start py-2">
          <Text className="text-base font-medium text-[#39745F]">← Back</Text>
        </Pressable>

        <Text className="mt-8 text-sm font-medium uppercase tracking-widest text-[#85877D]">
          BUILD A ROUTINE
        </Text>

        <Text className="mt-3 text-3xl font-semibold text-[#26382F]">
          A little starts here.
        </Text>

        <Text className="mt-3 text-base leading-6 text-[#85877D]">
          Choose one small action you'd like to make part of your day.
        </Text>

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
            className="rounded-2xl border border-[#DCD8CC] bg-white px-4 py-4 text-base text-[#26382F]"
          />

          <Text className="mt-2 text-right text-xs text-[#85877D]">
            {title.length}/60
          </Text>
        </View>

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
            className="min-h-28 rounded-2xl border border-[#DCD8CC] bg-white px-4 py-4 text-base text-[#26382F]"
          />

          <Text className="mt-2 text-right text-xs text-[#85877D]">
            {description.length}/120
          </Text>
        </View>

        <View className="mt-8 rounded-2xl bg-[#EAE6DA] p-5">
          <Text className="text-sm font-semibold text-[#294D3C]">
            Keep it achievable
          </Text>
          <Text className="mt-2 text-sm leading-5 text-[#6F766B]">
            Start with something small enough to do even on a busy day.
            Consistency matters more than perfection.
          </Text>
        </View>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          className={`mt-8 items-center rounded-2xl bg-[#39745F] py-4 ${
            saving ? "opacity-60" : ""
          }`}
        >
          <Text className="text-base font-semibold text-white">
            {saving ? "Saving..." : "Create habit"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
