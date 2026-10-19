import AsyncStorage from "@react-native-async-storage/async-storage";
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

const SETTINGS_KEY = "@stillday/settings";

type AppSettings = {
  appearance: "light" | "dark";
  remindersEnabled: boolean;
};

const DEFAULT_SETTINGS: AppSettings = {
  appearance: "light",
  remindersEnabled: false,
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_KEY);

        if (stored && active) {
          const parsed = JSON.parse(stored);

          setSettings({
            appearance: parsed.appearance === "dark" ? "dark" : "light",
            remindersEnabled: parsed.remindersEnabled === true,
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
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSettings(previous);

      Alert.alert("Couldn't save settings", "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
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

      <Text className="mt-6 text-3xl font-semibold text-[#26382F]">
        Make it yours.
      </Text>

      <Text className="mt-2 text-base leading-6 text-[#85877D]">
        A few small choices to make Stillday work for you.
      </Text>

      {/* Appearance */}
      <Text className="mb-3 mt-9 text-sm font-semibold uppercase tracking-widest text-[#85877D]">
        APPEARANCE
      </Text>

      <View className="rounded-2xl border border-[#DCD8CC] bg-white p-4">
        <Text className="text-base font-semibold text-[#26382F]">
          Colour theme
        </Text>

        <Text className="mt-1 text-sm leading-5 text-[#85877D]">
          Choose how you prefer to view Stillday.
        </Text>

        <View className="mt-4 flex-row">
          <Pressable
            disabled={saving}
            onPress={() =>
              updateSettings({
                ...settings,
                appearance: "light",
              })
            }
            className={`mr-3 flex-1 items-center rounded-xl border p-4 ${
              settings.appearance === "light"
                ? "border-[#39745F] bg-[#F7F5EF]"
                : "border-[#DCD8CC] bg-white"
            }`}
          >
            <Text className="text-lg">☀</Text>

            <Text className="mt-2 font-semibold text-[#26382F]">Light</Text>

            {settings.appearance === "light" && (
              <Text className="mt-1 text-xs text-[#39745F]">Selected</Text>
            )}
          </Pressable>

          <Pressable
            disabled={saving}
            onPress={() =>
              updateSettings({
                ...settings,
                appearance: "dark",
              })
            }
            className={`flex-1 items-center rounded-xl border p-4 ${
              settings.appearance === "dark"
                ? "border-[#39745F] bg-[#EAE6DA]"
                : "border-[#DCD8CC] bg-white"
            }`}
          >
            <Text className="text-lg">☾</Text>

            <Text className="mt-2 font-semibold text-[#26382F]">Dark</Text>

            {settings.appearance === "dark" && (
              <Text className="mt-1 text-xs text-[#39745F]">Selected</Text>
            )}
          </Pressable>
        </View>

        {settings.appearance === "dark" && (
          <Text className="mt-3 text-xs leading-5 text-[#85877D]">
            Your preference is saved. Dark theme styling across the app will be
            implemented separately.
          </Text>
        )}
      </View>

      {/* Reminders */}
      <Text className="mb-3 mt-8 text-sm font-semibold uppercase tracking-widest text-[#85877D]">
        REMINDERS
      </Text>

      <View className="flex-row items-center rounded-2xl border border-[#DCD8CC] bg-white p-4">
        <View className="mr-4 flex-1">
          <Text className="text-base font-semibold text-[#26382F]">
            Daily reminders
          </Text>

          <Text className="mt-1 text-sm leading-5 text-[#85877D]">
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
            false: "#DCD8CC",
            true: "#39745F",
          }}
          thumbColor="#FFFFFF"
          accessibilityLabel="Daily reminders preference"
        />
      </View>

      <Text className="mt-2 px-1 text-xs leading-5 text-[#85877D]">
        This currently saves your preference only. Scheduling actual
        notifications will be added in a later step.
      </Text>

      {/* Data management */}
      <Text className="mb-3 mt-8 text-sm font-semibold uppercase tracking-widest text-[#85877D]">
        YOUR DATA
      </Text>

      <View className="rounded-2xl border border-[#DCD8CC] bg-white p-4">
        <Text className="text-base font-semibold text-[#26382F]">
          Stored on your device
        </Text>

        <Text className="mt-2 text-sm leading-5 text-[#85877D]">
          Your habits, completion history, and preferences are stored locally on
          this device.
        </Text>

        <View className="my-4 h-px bg-[#DCD8CC]" />

        <Text className="text-sm leading-5 text-[#85877D]">
          A data reset and backup options can be added once the core experience
          is complete.
        </Text>
      </View>

      {/* About */}
      <Text className="mb-3 mt-8 text-sm font-semibold uppercase tracking-widest text-[#85877D]">
        ABOUT
      </Text>

      <View className="items-center rounded-3xl bg-[#EAE6DA] p-6">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#39745F]">
          <Text className="text-2xl font-semibold text-white">S</Text>
        </View>

        <Text className="mt-4 text-xl font-semibold text-[#26382F]">
          Stillday
        </Text>

        <Text className="mt-1 text-sm text-[#85877D]">Version 1.0.0</Text>

        <Text className="mt-4 text-center text-sm leading-6 text-[#6F766B]">
          A little progress, every day.
          {"\n"}
          Build routines at your own pace.
        </Text>
      </View>

      {saving && (
        <Text className="mt-4 text-center text-xs text-[#85877D]">
          Saving your preferences...
        </Text>
      )}

      <Text className="mt-6 text-center text-xs text-[#85877D]">
        Made for small steps and meaningful days.
      </Text>
    </ScrollView>
  );
}
