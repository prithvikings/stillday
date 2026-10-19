import { Text, View } from "react-native";

export default function InsightsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-[#F7F5EF]">
      <Text className="text-2xl font-semibold text-[#26382F]">Insights</Text>
      <Text className="mt-2 text-[#85877D]">
        Your progress and trends will appear here.
      </Text>
    </View>
  );
}
