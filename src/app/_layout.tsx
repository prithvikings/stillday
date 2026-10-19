import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../../global.css";
import { CompletionsProvider } from "../hooks/CompletionsProvider";
import { HabitsProvider } from "../hooks/HabitsProvider";

export default function RootLayout() {
  return (
    <CompletionsProvider>
      <HabitsProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#F7F5EF" },
          }}
        />
      </HabitsProvider>
    </CompletionsProvider>
  );
}
