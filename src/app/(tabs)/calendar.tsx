import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";
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
  const { habits, loading: habitsLoading } = useHabits();

  const { completions, loading: completionsLoading, today } = useCompletions();

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(() => new Date());

  if (habitsLoading || completionsLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F7F5EF]">
        <ActivityIndicator size="large" color="#39745F" />
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
        Your journey.
      </Text>

      <Text className="mt-2 text-base leading-6 text-[#85877D]">
        Every day is another opportunity to show up.
      </Text>

      {/* Monthly overview */}
      <View className="mt-8 rounded-3xl bg-[#294D3C] p-6">
        {habits.length === 0 ? (
          <>
            <Text className="text-sm font-medium text-[#D5E0D5]">
              YOUR JOURNEY STARTS HERE
            </Text>

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
            <Text className="text-sm font-medium text-[#D5E0D5]">
              THIS MONTH
            </Text>

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
      <View className="mt-6 rounded-3xl border border-[#DCD8CC] bg-white p-4">
        {/* Month navigation */}
        <View className="mb-6 flex-row items-center justify-between">
          <Pressable
            onPress={() => changeMonth(-1)}
            accessibilityLabel="Previous month"
            className="h-10 w-10 items-center justify-center rounded-full bg-[#F7F5EF]"
          >
            <Text className="text-xl text-[#39745F]">‹</Text>
          </Pressable>

          <Text className="text-lg font-semibold text-[#26382F]">
            {MONTHS[month]} {year}
          </Text>

          <Pressable
            onPress={() => changeMonth(1)}
            accessibilityLabel="Next month"
            className="h-10 w-10 items-center justify-center rounded-full bg-[#F7F5EF]"
          >
            <Text className="text-xl text-[#39745F]">›</Text>
          </Pressable>
        </View>

        {/* Weekday headings */}
        <View className="mb-3 flex-row">
          {WEEKDAYS.map((day, index) => (
            <View key={`${day}-${index}`} className="flex-1 items-center">
              <Text className="text-xs font-semibold text-[#85877D]">
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
                        isSelected
                          ? "bg-[#39745F]"
                          : isToday
                            ? "border border-[#39745F] bg-[#F7F5EF]"
                            : ""
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          isSelected
                            ? "font-semibold text-white"
                            : isFuture
                              ? "text-[#C8C8BF]"
                              : "text-[#26382F]"
                        }`}
                      >
                        {day}
                      </Text>
                    </Pressable>

                    {/* Completion indicator */}
                    <View className="mt-0.5 h-1.5 items-center justify-center">
                      {hasCompletion && (
                        <View
                          className={`h-1 w-1 rounded-full ${
                            isSelected ? "bg-[#DCE8D5]" : "bg-[#39745F]"
                          }`}
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
        <Text className="text-sm font-medium uppercase tracking-widest text-[#85877D]">
          YOUR DAY
        </Text>

        <Text className="mt-2 text-xl font-semibold text-[#26382F]">
          {formatSelectedDate(selectedDate)}
        </Text>

        <View className="mt-4 rounded-2xl border border-[#DCD8CC] bg-white p-5">
          <View className="flex-row items-end justify-between">
            <Text className="text-base font-semibold text-[#26382F]">
              {habits.length === 0 ? "A fresh start" : "Daily progress"}
            </Text>

            {habits.length > 0 && (
              <Text className="text-sm font-medium text-[#39745F]">
                {selectedCompletedCount}/{habits.length}
              </Text>
            )}
          </View>

          <View className="mt-3 h-2 overflow-hidden rounded-full bg-[#EAE6DA]">
            <View
              className="h-full rounded-full bg-[#39745F]"
              style={{ width: `${selectedProgress * 100}%` }}
            />
          </View>

          {habits.length === 0 ? (
            <View className="mt-4">
              <Text className="text-sm leading-6 text-[#85877D]">
                Your completed habits will appear here as you build your
                routine.
              </Text>

              <Pressable
                onPress={() => router.push("/habits/new")}
                accessibilityRole="button"
                className="mt-4 items-center rounded-full bg-[#39745F] px-5 py-3"
              >
                <Text className="font-semibold text-white">
                  + Create your first habit
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="mt-4">
              {habits.map((habit) => {
                const isCompleted = selectedCompletionIds.includes(habit.id);

                return (
                  <View key={habit.id} className="mb-3 flex-row items-center">
                    <View
                      className={`mr-3 h-6 w-6 items-center justify-center rounded-full ${
                        isCompleted
                          ? "bg-[#39745F]"
                          : "border border-[#DCD8CC] bg-white"
                      }`}
                    >
                      {isCompleted && (
                        <Text className="text-xs font-bold text-white">✓</Text>
                      )}
                    </View>

                    <Text
                      className={`flex-1 text-sm ${
                        isCompleted ? "text-[#26382F]" : "text-[#85877D]"
                      }`}
                    >
                      {habit.title}
                    </Text>

                    <Text className="text-xs text-[#85877D]">
                      {isCompleted ? "Done" : "Not completed"}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>

      <Text className="mt-6 text-center text-sm text-[#85877D]">
        Every little step counts.
      </Text>
    </ScrollView>
  );
}
