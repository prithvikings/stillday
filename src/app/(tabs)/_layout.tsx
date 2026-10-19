import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Tabs, usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useAppTheme } from "../../hooks/ThemeProvider";

const TAB_NAMES = ["index", "calendar", "insights", "settings"] as const;
const TAB_LABELS = ["Today", "Calendar", "Insights", "Settings"] as const;

export default function TabLayout() {
  const { colors, isDark } = useAppTheme();
  const pathname = usePathname();
  const { width: windowWidth } = useWindowDimensions();
  const underlineX = useRef(new Animated.Value(0)).current;
  const [barWidth, setBarWidth] = useState(0);

  const selectedTabIndex = Math.max(
    0,
    TAB_NAMES.findIndex((name) =>
      name === "index"
        ? pathname === "/" || pathname.endsWith("/index")
        : pathname.includes(`/${name}`),
    ),
  );

  // Approximate the inner width of the floating bar, accounting for its side margins.
  const measuredWidth = barWidth || windowWidth - 52;
  const tabWidth = measuredWidth / TAB_NAMES.length;
  const underlineWidth = 22;
  const activeColor = isDark ? colors.primary : "#39745F";

  useEffect(() => {
    Animated.timing(underlineX, {
      toValue: selectedTabIndex * tabWidth + (tabWidth - underlineWidth) / 2,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selectedTabIndex, tabWidth, underlineX]);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,

          tabBarButton: (props) => (
            <Pressable
              {...props}
              ref={undefined}
              android_ripple={null}
              android_disableSound
              style={({ pressed }) => [
                props.style,
                {
                  opacity: pressed ? 0.72 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
            />
          ),

          animation: "none",
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: isDark ? colors.textSecondary : "#85877D",

          tabBarStyle: {
            position: "absolute",
            left: 26,
            right: 26,
            bottom: 35,
            height: 70,
            paddingTop: 7,
            paddingHorizontal: 5,
            borderTopWidth: 0,
            borderRadius: 27,
            backgroundColor: isDark ? colors.tabBar : "#F7F5EF",
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.12 : 0.02,
            shadowRadius: 5,
            elevation: 2,
            marginHorizontal: 26,
          },

          tabBarItemStyle: {
            borderRadius: 20,
          },

          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "500",
            marginTop: -2,
          },

          tabBarIconStyle: {
            marginTop: 0,
          },
        }}
        tabBar={(props) => {
          const { state, descriptors, navigation } = props;
          const activeIndex = state.index;

          return (
            <View
              onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
              style={{
                position: "absolute",
                left: 26,
                right: 26,
                bottom: 35,
                height: 70,
                borderRadius: 27,
                backgroundColor: isDark ? colors.tabBar : "#F7F5EF",
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.12 : 0.02,
                shadowRadius: 5,
                elevation: 2,
                flexDirection: "row",
                alignItems: "stretch",
                paddingHorizontal: 5,
                paddingTop: 7,
              }}
            >
              {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const focused = activeIndex === index;
                const color = focused
                  ? activeColor
                  : isDark
                    ? colors.textSecondary
                    : "#85877D";
                const label = TAB_LABELS[index];

                const iconName =
                  index === 0
                    ? focused
                      ? "home"
                      : "home-outline"
                    : index === 1
                      ? focused
                        ? "calendar"
                        : "calendar-outline"
                      : index === 2
                        ? focused
                          ? "stats-chart"
                          : "stats-chart-outline"
                        : focused
                          ? "settings"
                          : "settings-outline";

                const iconSize = index === 0 || index === 3 ? 23 : 22;

                return (
                  <Pressable
                    key={route.key}
                    accessibilityRole="button"
                    accessibilityState={focused ? { selected: true } : {}}
                    accessibilityLabel={
                      options.tabBarAccessibilityLabel ?? label
                    }
                    onPress={() => {
                      const event = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                        canPreventDefault: true,
                      });

                      if (!focused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                      }
                    }}
                    onLongPress={() =>
                      navigation.emit({
                        type: "tabLongPress",
                        target: route.key,
                      })
                    }
                    style={({ pressed }) => ({
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "flex-start",
                      borderRadius: 20,
                      opacity: pressed ? 0.72 : 1,
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    })}
                  >
                    <Ionicons
                      name={iconName as any}
                      size={iconSize}
                      color={color}
                    />
                    <Text
                      numberOfLines={1}
                      style={{
                        color,
                        fontSize: 10,
                        fontWeight: "500",
                        marginTop: 1,
                      }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}

              <Animated.View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  bottom: 17,
                  left: 0,
                  width: underlineWidth,
                  height: 3,
                  borderRadius: 999,
                  backgroundColor: activeColor,
                  transform: [{ translateX: underlineX }],
                }}
              />
            </View>
          );
        }}
      />
    </View>
  );
}
