import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { useSharedCompletions } from "../../hooks/CompletionsProvider";
import { useHabits } from "../../hooks/HabitsProvider";
import { useAppTheme } from "../../hooks/ThemeProvider";
import { exportBackup } from "../../services/backup";

const SETTINGS_KEY = "@stillday/settings";

type AppSettings = {
  appearance: "system" | "light" | "dark";
  weekStartsOn: "monday" | "sunday";
  remindersEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
};

const DEFAULT_SETTINGS: AppSettings = {
  appearance: "system",
  weekStartsOn: "monday",
  remindersEnabled: false,
  reminderHour: 8,
  reminderMinute: 0,
};

export default function SettingsScreen() {
  const { habits, replaceHabits, resetHabits } = useHabits();
  const { appearance, setAppearance, colors, isDark } = useAppTheme();
  const { completions, replaceCompletions, resetCompletions } =
    useSharedCompletions();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);

  function formatReminderTime(hour: number, minute: number) {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_KEY);

        if (stored && active) {
          const parsed = JSON.parse(stored);

          setSettings({
            appearance:
              parsed.appearance === "dark" || parsed.appearance === "light"
                ? parsed.appearance
                : "system",
            weekStartsOn:
              parsed.weekStartsOn === "sunday" ? "sunday" : "monday",
            remindersEnabled: parsed.remindersEnabled === true,
            reminderHour:
              typeof parsed.reminderHour === "number" &&
              parsed.reminderHour >= 0 &&
              parsed.reminderHour <= 23
                ? parsed.reminderHour
                : 8,
            reminderMinute:
              typeof parsed.reminderMinute === "number" &&
              parsed.reminderMinute >= 0 &&
              parsed.reminderMinute <= 59
                ? parsed.reminderMinute
                : 0,
          });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);

        Alert.alert(
          "Couldn't load settings",
          "Default settings will be used for this session.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  async function updateSettings(next: AppSettings) {
    if (saving) return;

    const previous = settings;

    setSettings(next);
    setSaving(true);

    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));

      if (next.appearance !== previous.appearance) {
        await setAppearance(next.appearance);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSettings(previous);

      // Restore the previous appearance if saving fails.
      try {
        if (appearance !== previous.appearance) {
          await setAppearance(previous.appearance);
        }
      } catch (restoreError) {
        console.error("Failed to restore appearance:", restoreError);
      }

      Alert.alert("Couldn't save settings", "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleExportData() {
    try {
      await exportBackup();
    } catch (error) {
      console.error("Failed to export Stillday data:", error);

      Alert.alert(
        "Export failed",
        "We couldn't create your backup. Please try again.",
      );
    }
  }

  async function handleImportData() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "text/json"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const file = result.assets[0];
      const json = await new File(file.uri).text();

      // Validate the backup before asking to replace existing data.
      const { parseBackup } = await import("../../services/importBackup");
      const backup = parseBackup(json);

      Alert.alert(
        "Replace your data?",
        "Importing this backup will replace your current habits and completion history. Export your current data first if you want to keep a separate copy.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Replace data",
            style: "destructive",
            onPress: () => {
              void (async () => {
                // Keep the current state so we can attempt to restore it
                // if either replacement fails.
                const previousHabits = habits;
                const previousCompletions = completions;

                try {
                  await replaceHabits(backup.data.habits);
                  await replaceCompletions(backup.data.completions);

                  Alert.alert(
                    "Import complete",
                    "Your habits and completion history have been restored.",
                  );
                } catch (error) {
                  console.error("Failed to import Stillday data:", error);

                  // Best-effort rollback through the providers.
                  try {
                    await replaceHabits(previousHabits);
                    await replaceCompletions(previousCompletions);
                  } catch (rollbackError) {
                    console.error(
                      "Failed to restore the previous app state:",
                      rollbackError,
                    );
                  }

                  Alert.alert(
                    "Import failed",
                    error instanceof Error
                      ? error.message
                      : "We couldn't import this backup. Please try again.",
                  );
                }
              })();
            },
          },
        ],
      );
    } catch (error) {
      console.error("Failed to select or validate Stillday backup:", error);

      Alert.alert(
        "Import failed",
        error instanceof Error
          ? error.message
          : "We couldn't open that file. Please select a valid Stillday JSON backup.",
      );
    }
  }

  async function handleResetData() {
    Alert.alert(
      "Reset all data?",
      "This will permanently delete all your habits and completion history from this device. Your settings will be kept. This action cannot be undone unless you have a backup.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset data",
          style: "destructive",
          onPress: () => {
            void (async () => {
              const previousHabits = habits;
              const previousCompletions = completions;

              try {
                await resetHabits();
                await resetCompletions();

                Alert.alert(
                  "Data reset",
                  "Your habits and completion history have been cleared.",
                );
              } catch (error) {
                console.error("Failed to reset Stillday data:", error);

                // Attempt to restore the previous data if resetting fails.
                try {
                  await replaceHabits(previousHabits);
                  await replaceCompletions(previousCompletions);
                } catch (rollbackError) {
                  console.error(
                    "Failed to restore data after reset:",
                    rollbackError,
                  );
                }

                Alert.alert(
                  "Reset failed",
                  "We couldn't reset all your data. Please check your data before trying again.",
                );
              }
            })();
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: isDark ? colors.background : "#F7F5EF" }}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? colors.primary : "#39745F"}
        />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: isDark ? colors.background : "#F7F5EF" }}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 64,
        paddingBottom: 130,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text
        className="text-sm font-medium uppercase tracking-widest"
        style={{ color: isDark ? colors.textSecondary : "#85877D" }}
      >
        STILLDAY
      </Text>

      <Text
        className="mt-6 text-3xl font-semibold"
        style={{ color: isDark ? colors.text : "#26382F" }}
      >
        Make it yours.
      </Text>

      <Text
        className="mt-2 text-base leading-6"
        style={{ color: isDark ? colors.textSecondary : "#85877D" }}
      >
        A few small choices to make Stillday work for you.
      </Text>

      {/* Appearance */}
      <Text
        className="mb-3 mt-9 text-sm font-semibold uppercase tracking-widest"
        style={{ color: isDark ? colors.textSecondary : "#85877D" }}
      >
        APPEARANCE
      </Text>

      <View
        className="rounded-2xl border p-4"
        style={{
          backgroundColor: isDark ? colors.card : "#FFFFFF",
          borderColor: isDark ? colors.border : "#DCD8CC",
        }}
      >
        <Text
          className="text-base font-semibold"
          style={{ color: isDark ? colors.text : "#26382F" }}
        >
          Colour theme
        </Text>

        <Text
          className="mt-1 text-sm leading-5"
          style={{ color: isDark ? colors.textSecondary : "#85877D" }}
        >
          Choose how you prefer to view Stillday.
        </Text>

        <View className="mt-4 flex-row">
          {(["system", "light", "dark"] as const).map((appearanceOption) => {
            const selected = settings.appearance === appearanceOption;

            const label =
              appearanceOption === "system"
                ? "System"
                : appearanceOption === "light"
                  ? "Light"
                  : "Dark";

            const iconName =
              appearanceOption === "system"
                ? "phone-portrait-outline"
                : appearanceOption === "light"
                  ? "sunny-outline"
                  : "moon-outline";

            return (
              <Pressable
                key={appearanceOption}
                disabled={saving}
                onPress={() =>
                  updateSettings({
                    ...settings,
                    appearance: appearanceOption,
                  })
                }
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className="mr-2 flex-1 items-center rounded-xl border p-3"
                style={{
                  backgroundColor: selected
                    ? isDark
                      ? colors.primary
                      : "#39745F"
                    : isDark
                      ? colors.muted
                      : "#F7F5EF",
                  borderColor: selected
                    ? isDark
                      ? colors.primary
                      : "#39745F"
                    : isDark
                      ? colors.border
                      : "#DCD8CC",
                }}
              >
                <Ionicons
                  name={iconName as any}
                  size={21}
                  color={
                    selected
                      ? isDark
                        ? "#171E1A"
                        : "#FFFFFF"
                      : isDark
                        ? colors.text
                        : "#26382F"
                  }
                />

                <Text
                  className="mt-2 text-sm font-semibold"
                  style={{
                    color: selected
                      ? isDark
                        ? "#171E1A"
                        : "#FFFFFF"
                      : isDark
                        ? colors.text
                        : "#26382F",
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Week starts on */}
      <Text
        className="mb-3 mt-8 text-sm font-semibold uppercase tracking-widest"
        style={{ color: isDark ? colors.textSecondary : "#85877D" }}
      >
        WEEK STARTS ON
      </Text>

      <View
        className="rounded-2xl border p-4"
        style={{
          backgroundColor: isDark ? colors.card : "#FFFFFF",
          borderColor: isDark ? colors.border : "#DCD8CC",
        }}
      >
        <Text
          className="text-base font-semibold"
          style={{ color: isDark ? colors.text : "#26382F" }}
        >
          First day of the week
        </Text>

        <Text
          className="mt-1 text-sm leading-5"
          style={{ color: isDark ? colors.textSecondary : "#85877D" }}
        >
          Choose how your weekly progress is organized.
        </Text>

        <View className="mt-4 flex-row">
          {(["monday", "sunday"] as const).map((day) => {
            const selected = settings.weekStartsOn === day;

            return (
              <Pressable
                key={day}
                disabled={saving}
                onPress={() =>
                  updateSettings({
                    ...settings,
                    weekStartsOn: day,
                  })
                }
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className="mr-2 flex-1 items-center rounded-xl border p-4"
                style={{
                  backgroundColor: selected
                    ? isDark
                      ? colors.primary
                      : "#39745F"
                    : isDark
                      ? colors.muted
                      : "#F7F5EF",
                  borderColor: selected
                    ? isDark
                      ? colors.primary
                      : "#39745F"
                    : isDark
                      ? colors.border
                      : "#DCD8CC",
                }}
              >
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color={
                    selected
                      ? isDark
                        ? "#171E1A"
                        : "#FFFFFF"
                      : isDark
                        ? colors.text
                        : "#26382F"
                  }
                />
                <Text
                  className="mt-2 font-semibold"
                  style={{
                    color: selected
                      ? isDark
                        ? "#171E1A"
                        : "#FFFFFF"
                      : isDark
                        ? colors.text
                        : "#26382F",
                  }}
                >
                  {day === "monday" ? "Monday" : "Sunday"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Reminders */}
      <Text
        className="mb-3 mt-8 text-sm font-semibold uppercase tracking-widest"
        style={{ color: isDark ? colors.textSecondary : "#85877D" }}
      >
        REMINDERS
      </Text>

      <View
        className="flex-row items-center rounded-2xl border p-4"
        style={{
          backgroundColor: isDark ? colors.card : "#FFFFFF",
          borderColor: isDark ? colors.border : "#DCD8CC",
        }}
      >
        <View
          className="mr-3 h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: isDark ? colors.surface : "#EAE6DA" }}
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={isDark ? colors.primary : "#39745F"}
          />
        </View>
        <View className="mr-3 flex-1">
          <Text
            className="text-base font-semibold"
            style={{ color: isDark ? colors.text : "#26382F" }}
          >
            Daily reminders
          </Text>

          <Text
            className="mt-1 text-sm leading-5"
            style={{ color: isDark ? colors.textSecondary : "#85877D" }}
          >
            Keep a gentle reminder of the habits you want to build.
          </Text>
        </View>

        <Switch
          value={settings.remindersEnabled}
          disabled={saving}
          onValueChange={(value) =>
            updateSettings({
              ...settings,
              remindersEnabled: value,
            })
          }
          trackColor={{
            false: isDark ? colors.border : "#DCD8CC",
            true: isDark ? colors.primary : "#39745F",
          }}
          thumbColor="#FFFFFF"
          accessibilityLabel="Daily reminders preference"
        />
      </View>

      <Pressable
        disabled={saving}
        onPress={() => setShowReminderTimePicker(true)}
        accessibilityRole="button"
        className="mt-3 flex-row items-center justify-between rounded-2xl border p-4"
        style={{
          backgroundColor: isDark ? colors.card : "#FFFFFF",
          borderColor: isDark ? colors.border : "#DCD8CC",
        }}
      >
        <View className="flex-1">
          <Text
            className="text-base font-semibold"
            style={{ color: isDark ? colors.text : "#26382F" }}
          >
            Reminder time
          </Text>

          <Text
            className="mt-1 text-sm"
            style={{ color: isDark ? colors.textSecondary : "#85877D" }}
          >
            Choose when you'd like your gentle reminder.
          </Text>
        </View>

        <View className="ml-3 flex-row items-center">
          <Ionicons
            name="time-outline"
            size={18}
            color={isDark ? colors.primary : "#39745F"}
          />
          <Text
            className="ml-2 font-semibold"
            style={{ color: isDark ? colors.primary : "#39745F" }}
          >
            {formatReminderTime(settings.reminderHour, settings.reminderMinute)}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={17}
            color={isDark ? colors.primary : "#39745F"}
            style={{ marginLeft: 6 }}
          />
        </View>
      </Pressable>

      {showReminderTimePicker && (
        <DateTimePicker
          value={(() => {
            const date = new Date();
            date.setHours(settings.reminderHour, settings.reminderMinute, 0, 0);
            return date;
          })()}
          mode="time"
          display="default"
          onValueChange={(event, selectedDate) => {
            setShowReminderTimePicker(false);

            if (selectedDate) {
              updateSettings({
                ...settings,
                reminderHour: selectedDate.getHours(),
                reminderMinute: selectedDate.getMinutes(),
              });
            }
          }}
        />
      )}

      <Text
        className="mt-2 px-1 text-xs leading-5"
        style={{ color: isDark ? colors.textSecondary : "#85877D" }}
      >
        This currently saves your preference only. Scheduling actual
        notifications will be added in a later step.
      </Text>

      {/* Data management */}
      <Text
        className="mb-3 mt-8 text-sm font-semibold uppercase tracking-widest"
        style={{ color: isDark ? colors.textSecondary : "#85877D" }}
      >
        YOUR DATA
      </Text>

      <View
        className="rounded-2xl border p-4"
        style={{
          backgroundColor: isDark ? colors.card : "#FFFFFF",
          borderColor: isDark ? colors.border : "#DCD8CC",
        }}
      >
        <Text
          className="text-base font-semibold"
          style={{ color: isDark ? colors.text : "#26382F" }}
        >
          Stored on your device
        </Text>

        <Text
          className="mt-2 text-sm leading-5"
          style={{ color: isDark ? colors.textSecondary : "#85877D" }}
        >
          Your habits and completion history are stored locally on this device.
          Create a backup to keep a separate copy of your progress.
        </Text>

        <View
          className="my-4 h-px"
          style={{ backgroundColor: isDark ? colors.border : "#DCD8CC" }}
        />

        <Pressable
          onPress={handleExportData}
          disabled={saving}
          accessibilityRole="button"
          className="flex-row items-center rounded-xl border p-4"
          style={{
            backgroundColor: isDark ? colors.muted : "#F7F5EF",
            borderColor: isDark ? colors.border : "#DCD8CC",
          }}
        >
          <View
            className="mr-3 h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: isDark ? colors.surface : "#EAE6DA" }}
          >
            <Ionicons
              name="cloud-download-outline"
              size={21}
              color={isDark ? colors.primary : "#39745F"}
            />
          </View>

          <View className="flex-1">
            <Text
              className="font-semibold"
              style={{ color: isDark ? colors.text : "#26382F" }}
            >
              Export data
            </Text>

            <Text
              className="mt-1 text-sm leading-5"
              style={{ color: isDark ? colors.textSecondary : "#85877D" }}
            >
              Save your habits and progress as a JSON backup.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={isDark ? colors.primary : "#39745F"}
          />
        </Pressable>

        <Pressable
          onPress={handleImportData}
          disabled={saving}
          accessibilityRole="button"
          className="mt-3 flex-row items-center rounded-xl border p-4"
          style={{
            backgroundColor: isDark ? colors.muted : "#F7F5EF",
            borderColor: isDark ? colors.border : "#DCD8CC",
          }}
        >
          <View
            className="mr-3 h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: isDark ? colors.surface : "#EAE6DA" }}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={21}
              color={isDark ? colors.primary : "#39745F"}
            />
          </View>

          <View className="flex-1">
            <Text
              className="font-semibold"
              style={{ color: isDark ? colors.text : "#26382F" }}
            >
              Import data
            </Text>

            <Text
              className="mt-1 text-sm leading-5"
              style={{ color: isDark ? colors.textSecondary : "#85877D" }}
            >
              Restore habits and progress from a backup file.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={isDark ? colors.primary : "#39745F"}
          />
        </Pressable>

        <Pressable
          onPress={handleResetData}
          disabled={saving}
          accessibilityRole="button"
          className="mt-3 flex-row items-center rounded-xl border p-4"
          style={{
            backgroundColor: isDark ? colors.card : "#FFFFFF",
            borderColor: isDark ? `${colors.danger}66` : "#A4473D4D",
          }}
        >
          <View
            className="mr-3 h-10 w-10 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark ? `${colors.danger}1A` : "#A4473D1A",
            }}
          >
            <Ionicons
              name="trash-outline"
              size={21}
              color={isDark ? colors.danger : "#A4473D"}
            />
          </View>

          <View className="flex-1">
            <Text
              className="font-semibold"
              style={{ color: isDark ? colors.danger : "#A4473D" }}
            >
              Reset all data
            </Text>

            <Text
              className="mt-1 text-sm leading-5"
              style={{ color: isDark ? colors.textSecondary : "#85877D" }}
            >
              Delete all habits and completion history.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={isDark ? colors.danger : "#A4473D"}
          />
        </Pressable>
      </View>

      {/* About */}
      <Text
        className="mb-3 mt-8 text-sm font-semibold uppercase tracking-widest"
        style={{ color: isDark ? colors.textSecondary : "#85877D" }}
      >
        ABOUT
      </Text>

      <View
        className="items-center rounded-3xl p-6"
        style={{ backgroundColor: isDark ? colors.surface : "#EAE6DA" }}
      >
        <View
          className="h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: isDark ? colors.primary : "#39745F" }}
        >
          <Text
            className="text-2xl font-semibold"
            style={{ color: isDark ? "#171E1A" : "#FFFFFF" }}
          >
            S
          </Text>
        </View>

        <Text
          className="mt-4 text-xl font-semibold"
          style={{ color: isDark ? colors.text : "#26382F" }}
        >
          Stillday
        </Text>

        <Text
          className="mt-1 text-sm"
          style={{ color: isDark ? colors.textSecondary : "#85877D" }}
        >
          Version 1.0.0
        </Text>

        <Text
          className="mt-4 text-center text-sm leading-6"
          style={{ color: isDark ? colors.textSecondary : "#6F766B" }}
        >
          A little progress, every day.
          {"\n"}
          Build routines at your own pace.
        </Text>
      </View>

      {saving && (
        <Text
          className="mt-4 text-center text-xs"
          style={{ color: isDark ? colors.textSecondary : "#85877D" }}
        >
          Saving your preferences...
        </Text>
      )}

      <Text
        className="mt-6 text-center text-xs"
        style={{ color: isDark ? colors.textSecondary : "#85877D" }}
      >
        Made for small steps and meaningful days.
      </Text>
    </ScrollView>
  );
}
