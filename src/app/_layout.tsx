import "../../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { HabitsProvider } from "../hooks/HabitsProvider";

export default function RootLayout() {
  return (
    <HabitsProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F7F5EF" },
        }}
      />
    </HabitsProvider>
  );
}
