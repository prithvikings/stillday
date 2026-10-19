import { Tabs } from "expo-router";
import { Text } from "react-native";

const tabOptions = {
  headerShown: false,
  tabBarActiveTintColor: "#39745F",
  tabBarInactiveTintColor: "#85877D",
  tabBarStyle: {
    backgroundColor: "#F7F5EF",
    borderTopColor: "#DCD8CC",
    height: 84,
    paddingTop: 10,
    paddingBottom: 24,
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
};

export default function TabLayout() {
  return (
    <Tabs screenOptions={tabOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>◷</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>▦</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>↗</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>⚙</Text>
          ),
        }}
      />
    </Tabs>
  );
}
