import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors, type ThemeColors } from "../constants/theme";

const SETTINGS_KEY = "@stillday/settings";

type Appearance = "system" | "light" | "dark";

type ThemeContextValue = {
  appearance: Appearance;
  isDark: boolean;
  colors: ThemeColors;
  loading: boolean;
  setAppearance: (appearance: Appearance) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type StoredSettings = {
  appearance?: Appearance;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();

  const [appearance, setAppearanceState] = useState<Appearance>("system");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadAppearance() {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_KEY);

        if (stored) {
          const settings = JSON.parse(stored) as StoredSettings;

          if (
            settings.appearance === "light" ||
            settings.appearance === "dark" ||
            settings.appearance === "system"
          ) {
            if (mounted) {
              setAppearanceState(settings.appearance);
            }
          }
        }
      } catch (error) {
        console.warn("Could not load appearance preference:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAppearance();

    return () => {
      mounted = false;
    };
  }, []);

  const setAppearance = async (nextAppearance: Appearance) => {
    const previousAppearance = appearance;

    // Update immediately so the interface responds without waiting.
    setAppearanceState(nextAppearance);

    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      const settings = stored
        ? (JSON.parse(stored) as Record<string, unknown>)
        : {};

      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          ...settings,
          appearance: nextAppearance,
        }),
      );
    } catch (error) {
      setAppearanceState(previousAppearance);
      console.warn("Could not save appearance preference:", error);
      throw error;
    }
  };

  const isDark =
    appearance === "dark" ||
    (appearance === "system" && systemColorScheme === "dark");

  const value: ThemeContextValue = {
    appearance,
    isDark,
    colors: isDark ? darkColors : lightColors,
    loading,
    setAppearance,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }

  return context;
}
