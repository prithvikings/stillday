import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../../global.css";

import { CompletionsProvider } from "../hooks/CompletionsProvider";
import { HabitsProvider } from "../hooks/HabitsProvider";
import { ThemeProvider, useAppTheme } from "../hooks/ThemeProvider";

function AppLayout() {
  const { colors, isDark } = useAppTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <CompletionsProvider>
        <HabitsProvider>
          <AppLayout />
        </HabitsProvider>
      </CompletionsProvider>
    </ThemeProvider>
  );
}
