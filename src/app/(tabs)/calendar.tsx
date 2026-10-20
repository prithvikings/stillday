import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { useAppTheme } from "../../hooks/ThemeProvider";
import { useCompletions } from "../../hooks/useCompletions";
import { useHabits } from "../../hooks/useHabits";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function formatSelectedDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function CalendarScreen() {
  const { colors, isDark } = useAppTheme();
  const { habits, loading: habitsLoading } = useHabits();

  const { completions, loading: completionsLoading, today } = useCompletions();

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(() => new Date());

  if (habitsLoading || completionsLoading) {
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

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  const selectedDateKey = formatDate(selectedDate);
  const selectedCompletionIds = completions[selectedDateKey] ?? [];

  const selectedCompletedCount = habits.filter((habit) =>
    selectedCompletionIds.includes(habit.id),
  ).length;

  const selectedProgress =
    habits.length > 0 ? selectedCompletedCount / habits.length : 0;

  const monthKey = getMonthKey(visibleMonth);

  const completedDays = Object.entries(completions).filter(
    ([dateKey, ids]) =>
      dateKey.startsWith(`${monthKey}-`) &&
      ids.some((id) => habits.some((habit) => habit.id === id)),
  ).length;

  function changeMonth(direction: number) {
    setVisibleMonth(new Date(year, month + direction, 1));
  }

  return (
    <ScrollView
      className="flex-1"
      style={{
        backgroundColor: isDark ? colors.background : "#F7F5EF",
      }}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 64,
        paddingBottom: 130,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text
        className="text-sm font-medium uppercase tracking-widest text-[#85877D]"
        style={{ color: isDark ? colors.textSecondary : "#85877D" }}
      >
        STILLDAY
      </Text>

      <Text
        className="mt-6 text-3xl font-semibold text-[#26382F]"
        style={{ color: isDark ? colors.text : "#26382F" }}
      >
        Your journey.
      </Text>

      <Text
        className="mt-2 text-base leading-6 text-[#85877D]"
        style={{ color: isDark ? colors.textSecondary : "#85877D" }}
      >
        Every day is another opportunity to show up.
      </Text>

      {/* Monthly overview */}
      <View className="mt-8 rounded-3xl bg-[#294D3C] p-6">
        {habits.length === 0 ? (
          <>
            <View className="flex-row items-center">
              <Ionicons
                name="leaf-outline"
                size={16}
                color="#D5E0D5"
                style={{ marginRight: 8 }}
              />
              <Text className="text-sm font-medium text-[#D5E0D5]">
                YOUR JOURNEY STARTS HERE
              </Text>
            </View>

            <Text className="mt-3 text-2xl font-semibold text-white">
              Every day is a new beginning.
            </Text>

            <Text className="mt-2 text-sm leading-6 text-[#D5E0D5]">
              Create your first habit and your progress will begin to appear on
              this calendar.
            </Text>
          </>
        ) : (
          <>
            <View className="flex-row items-center">
              <Ionicons
                name="calendar-outline"
                size={16}
                color="#D5E0D5"
                style={{ marginRight: 8 }}
              />
              <Text className="text-sm font-medium text-[#D5E0D5]">
                THIS MONTH
              </Text>
            </View>

            <Text className="mt-2 text-3xl font-semibold text-white">
              {completedDays} {completedDays === 1 ? "day" : "days"}
            </Text>

            <Text className="mt-1 text-sm text-[#D5E0D5]">
              with at least one completed habit
            </Text>
          </>
        )}
      </View>
      {/* Calendar card */}
      <View
        className="mt-6 rounded-3xl border p-4"
        style={{
          backgroundColor: isDark ? colors.card : "#FFFFFF",
          borderColor: isDark ? colors.border : "#DCD8CC",
        }}
      >
        {/* Month navigation */}
        <View className="mb-6 flex-row items-center justify-between">
          <Pressable
            onPress={() => changeMonth(-1)}
            accessibilityLabel="Previous month"
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark ? colors.muted : "#F7F5EF",
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#39745F" />
          </Pressable>

          <Text
            className="text-lg font-semibold"
            style={{ color: isDark ? colors.text : "#26382F" }}
          >
            {MONTHS[month]} {year}
          </Text>

          <Pressable
            onPress={() => changeMonth(1)}
            accessibilityLabel="Next month"
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark ? colors.muted : "#F7F5EF",
            }}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? colors.primary : "#39745F"}
            />
          </Pressable>
        </View>

        {/* Weekday headings */}
        <View className="mb-3 flex-row">
          {WEEKDAYS.map((day, index) => (
            <View key={`${day}-${index}`} className="flex-1 items-center">
              <Text
                className="text-xs font-semibold"
                style={{ color: isDark ? colors.textSecondary : "#85877D" }}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar dates */}
        {Array.from({ length: calendarCells.length / 7 }, (_, weekIndex) => (
          <View key={weekIndex} className="mb-2 flex-row">
            {calendarCells
              .slice(weekIndex * 7, weekIndex * 7 + 7)
              .map((day, dayIndex) => {
                if (day === null) {
                  return (
                    <View
                      key={`empty-${weekIndex}-${dayIndex}`}
                      className="flex-1 items-center justify-center"
                      style={{ height: 44 }}
                    />
                  );
                }

                const date = new Date(year, month, day);
                const dateKey = formatDate(date);
                const isSelected = dateKey === selectedDateKey;
                const isToday = dateKey === today;

                const dayCompletions = completions[dateKey] ?? [];

                const hasCompletion = dayCompletions.some((id) =>
                  habits.some((habit) => habit.id === id),
                );

                const isFuture = dateKey > today;

                return (
                  <View
                    key={dateKey}
                    className="flex-1 items-center justify-center"
                    style={{ height: 44 }}
                  >
                    <Pressable
                      onPress={() => setSelectedDate(date)}
                      disabled={isFuture}
                      accessibilityRole="button"
                      accessibilityLabel={`${MONTHS[month]} ${day}${
                        hasCompletion ? ", habits completed" : ""
                      }`}
                      accessibilityState={{ selected: isSelected }}
                      className={`h-9 w-9 items-center justify-center rounded-full ${
                        isSelected ? "" : isToday ? "border" : ""
                      }`}
                      style={
                        isSelected
                          ? {
                              backgroundColor: isDark
                                ? colors.primary
                                : "#39745F",
                            }
                          : isToday
                            ? {
                                borderColor: isDark
                                  ? colors.primary
                                  : "#39745F",
                                backgroundColor: isDark
                                  ? colors.muted
                                  : "#F7F5EF",
                              }
                            : undefined
                      }
                    >
                      <Text
                        className={`text-sm ${
                          isSelected ? "font-semibold" : ""
                        }`}
                        style={{
                          color: isSelected
                            ? "#FFFFFF"
                            : isFuture
                              ? isDark
                                ? colors.textSecondary
                                : "#C8C8BF"
                              : isDark
                                ? colors.text
                                : "#26382F",
                          opacity: isFuture && isDark ? 0.55 : 1,
                        }}
                      >
                        {day}
                      </Text>
                    </Pressable>

                    {/* Completion indicator */}
                    <View className="mt-0.5 h-1.5 items-center justify-center">
                      {hasCompletion && (
                        <View
                          className="h-1 w-1 rounded-full"
                          style={{
                            backgroundColor: isSelected
                              ? "#DCE8D5"
                              : isDark
                                ? colors.primary
                                : "#39745F",
                          }}
                        />
                      )}
                    </View>
                  </View>
                );
              })}
          </View>
        ))}
      </View>

      {/* Selected date summary */}
      <View className="mt-7">
        <View className="flex-row items-center">
          <Ionicons
            name="calendar-clear-outline"
            size={15}
            color={isDark ? colors.textSecondary : "#85877D"}
            style={{ marginRight: 7 }}
          />
          <Text
            className="text-sm font-medium uppercase tracking-widest"
            style={{ color: isDark ? colors.textSecondary : "#85877D" }}
          >
            YOUR DAY
          </Text>
        </View>

        <Text
          className="mt-2 text-xl font-semibold"
          style={{ color: isDark ? colors.text : "#26382F" }}
        >
          {formatSelectedDate(selectedDate)}
        </Text>

        <View
          className="mt-4 rounded-2xl border p-5"
          style={{
            backgroundColor: isDark ? colors.card : "#FFFFFF",
            borderColor: isDark ? colors.border : "#DCD8CC",
          }}
        >
          <View className="flex-row items-end justify-between">
            <View className="flex-row items-center">
              <Ionicons
                name={
                  habits.length === 0
                    ? "leaf-outline"
                    : "checkmark-circle-outline"
                }
                size={18}
                color={isDark ? colors.primary : "#39745F"}
                style={{ marginRight: 7 }}
              />
              <Text
                className="text-base font-semibold"
                style={{ color: isDark ? colors.text : "#26382F" }}
              >
                {habits.length === 0 ? "A fresh start" : "Daily progress"}
              </Text>
            </View>

            {habits.length > 0 && (
              <Text
                className="text-sm font-medium"
                style={{ color: isDark ? colors.primary : "#39745F" }}
              >
                {selectedCompletedCount}/{habits.length}
              </Text>
            )}
          </View>

          <View
            className="mt-3 h-2 overflow-hidden rounded-full"
            style={{ backgroundColor: isDark ? colors.muted : "#EAE6DA" }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${selectedProgress * 100}%`,
                backgroundColor: isDark ? colors.primary : "#39745F",
              }}
            />
          </View>

          {habits.length === 0 ? (
            <View className="mt-4">
              <Text
                className="text-sm leading-6"
                style={{ color: isDark ? colors.textSecondary : "#85877D" }}
              >
                Your completed habits will appear here as you build your
                routine.
              </Text>

              <Pressable
                onPress={() => router.push("/habits/new")}
                accessibilityRole="button"
                className="mt-4 items-center rounded-full bg-[#39745F] px-5 py-3"
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="add"
                    size={19}
                    color="#FFFFFF"
                    style={{ marginRight: 5 }}
                  />
                  <Text className="font-semibold text-white">
                    Create your first habit
                  </Text>
                </View>
              </Pressable>
            </View>
          ) : (
            <View className="mt-4">
              {habits.map((habit) => {
                const isCompleted = selectedCompletionIds.includes(habit.id);

                return (
                  <View key={habit.id} className="mb-3 flex-row items-center">
                    <View
                      className="mr-3 h-6 w-6 items-center justify-center rounded-full"
                      style={
                        isCompleted
                          ? {
                              backgroundColor: isDark
                                ? colors.primary
                                : "#39745F",
                            }
                          : {
                              backgroundColor: isDark ? colors.card : "#FFFFFF",
                              borderWidth: 1,
                              borderColor: isDark ? colors.border : "#DCD8CC",
                            }
                      }
                    >
                      {isCompleted && (
                        <Text className="text-xs font-bold text-white">✓</Text>
                      )}
                    </View>

                    <Text
                      className="flex-1 text-sm"
                      style={{
                        color: isCompleted
                          ? isDark
                            ? colors.text
                            : "#26382F"
                          : isDark
                            ? colors.textSecondary
                            : "#85877D",
                      }}
                    >
                      {habit.title}
                    </Text>

                    <Text
                      className="text-xs"
                      style={{
                        color: isDark ? colors.textSecondary : "#85877D",
                      }}
                    >
                      {isCompleted ? "Done" : "Not completed"}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>

      <Text
        className="mt-6 text-center text-sm"
        style={{ color: isDark ? colors.textSecondary : "#85877D" }}
      >
        Every little step counts.
      </Text>
    </ScrollView>
  );
}
