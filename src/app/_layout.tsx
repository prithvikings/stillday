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
          animation: "fade",
          animationDuration: 220,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen
          name="habits/new"
          options={{
            animation: "slide_from_bottom",
            animationDuration: 260,
          }}
        />
        <Stack.Screen
          name="habits/[id]"
          options={{
            animation: "slide_from_right",
            animationDuration: 260,
          }}
        />
        <Stack.Screen
          name="habits/[id]/edit"
          options={{
            animation: "slide_from_right",
            animationDuration: 260,
          }}
        />
      </Stack>
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
