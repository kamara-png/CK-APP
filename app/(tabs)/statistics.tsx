import { api } from "@/convex/_generated/api";
import ProgressRing from "@/components/ProgressRing";
import SwipeTabScreen from "@/components/SwipeTabScreen";
import WeeklyActivityChart from "@/components/WeeklyActivityChart";
import useTheme from "@/hooks/useTheme";
import { useSlowLoadingHint } from "@/hooks/useSlowLoadingHint";
import { computeStreakStats } from "@/lib/streaks";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

function formatDuration(ms: number) {
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(ms / (1000 * 60))}m`;
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

const StatisticsScreen = () => {
  const { colors } = useTheme();
  const todos = useQuery(api.todos.getTodos);
  const habitsOverview = useQuery(api.habits.getHabitsOverview);
  const styles = createStyles(colors);
  const slowLoading = useSlowLoadingHint(todos === undefined);

  if (todos === undefined) {
    return (
      <SwipeTabScreen path="/statistics">
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.primary} />
        {slowLoading && (
          <Text style={styles.hint}>
            Still connecting — make sure `npx convex dev` is running and
            EXPO_PUBLIC_CONVEX_URL is set correctly, then restart Expo.
          </Text>
        )}
      </View>
      </SwipeTabScreen>
    );
  }

  const total = todos.length;
  const completed = todos.filter((t) => t.iscompleted).length;
  const remaining = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
  const maxBar = Math.max(completed, remaining, 1);

  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const completedToday = todos.filter(
    (t) => t.completedAt && t.completedAt >= startOfToday.getTime()
  ).length;
  const upcomingReminders = todos.filter((t) => t.reminderAt && t.reminderAt > now).length;

  const completionTimes = todos
    .filter((t) => t.completedAt)
    .map((t) => t.completedAt! - t._creationTime);
  const avgCompletionMs =
    completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : null;

  const cards = [
    { label: "Total", value: total, icon: "list-outline", color: colors.primary },
    { label: "Completed", value: completed, icon: "checkmark-circle-outline", color: colors.success },
    { label: "Remaining", value: remaining, icon: "time-outline", color: colors.warning },
  ] as const;

  const productivityCards = [
    { label: "Done today", value: String(completedToday), icon: "today-outline", color: colors.success },
    {
      label: "Avg. to finish",
      value: avgCompletionMs !== null ? formatDuration(avgCompletionMs) : "—",
      icon: "hourglass-outline",
      color: colors.primary,
    },
    {
      label: "Reminders set",
      value: String(upcomingReminders),
      icon: "alarm-outline",
      color: colors.warning,
    },
  ] as const;

  const habitsWithStats = (habitsOverview ?? []).map((h) => ({
    ...h,
    stats: computeStreakStats(h.dateKeys),
  }));
  const bestStreak = habitsWithStats.reduce((max, h) => Math.max(max, h.stats.current), 0);
  const totalCheckins = habitsWithStats.reduce((sum, h) => sum + h.dateKeys.length, 0);

  return (
    <SwipeTabScreen path="/statistics">
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.title}>Statistics</Text>

      {total === 0 ? (
        <Text style={styles.empty}>
          Add some todos on the Todos tab to see stats here.
        </Text>
      ) : (
        <>
          <View style={styles.ringSection}>
            <ProgressRing percent={rate} color={colors.success} trackColor={colors.border}>
              <View style={styles.ringCenter}>
                <Text style={styles.ringPercent}>{rate}%</Text>
                <Text style={styles.ringLabel}>done</Text>
              </View>
            </ProgressRing>
          </View>

          <View style={styles.cardsRow}>
            {cards.map((card) => (
              <View key={card.label} style={styles.card}>
                <Ionicons name={card.icon} size={22} color={card.color} />
                <Text style={styles.cardValue}>{card.value}</Text>
                <Text style={styles.cardLabel}>{card.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Productivity</Text>
            <View style={styles.cardsRow}>
              {productivityCards.map((card) => (
                <View key={card.label} style={styles.miniCard}>
                  <Ionicons name={card.icon} size={18} color={card.color} />
                  <Text style={styles.miniCardValue}>{card.value}</Text>
                  <Text style={styles.cardLabel}>{card.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed vs remaining</Text>
            <View style={styles.barsRow}>
              <View style={styles.barGroup}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${(completed / maxBar) * 100}%`,
                        backgroundColor: colors.success,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barCount}>{completed}</Text>
                <Text style={styles.barLabel}>Completed</Text>
              </View>
              <View style={styles.barGroup}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${(remaining / maxBar) * 100}%`,
                        backgroundColor: colors.warning,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barCount}>{remaining}</Text>
                <Text style={styles.barLabel}>Remaining</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Added this week</Text>
            <WeeklyActivityChart
              todos={todos}
              color={colors.primary}
              trackColor={colors.border}
              textColor={colors.text}
              mutedColor={colors.textMuted}
            />
          </View>

          {habitsWithStats.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Streaks overview</Text>
              <View style={styles.cardsRow}>
                <View style={styles.miniCard}>
                  <Ionicons name="flame-outline" size={18} color={colors.danger} />
                  <Text style={styles.miniCardValue}>{habitsWithStats.length}</Text>
                  <Text style={styles.cardLabel}>Active streaks</Text>
                </View>
                <View style={styles.miniCard}>
                  <Ionicons name="trophy-outline" size={18} color={colors.warning} />
                  <Text style={styles.miniCardValue}>{bestStreak}</Text>
                  <Text style={styles.cardLabel}>Best streak</Text>
                </View>
                <View style={styles.miniCard}>
                  <Ionicons name="checkmark-done-outline" size={18} color={colors.success} />
                  <Text style={styles.miniCardValue}>{totalCheckins}</Text>
                  <Text style={styles.cardLabel}>Check-ins</Text>
                </View>
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
    </SwipeTabScreen>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
      paddingHorizontal: 16,
      paddingTop: 60,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 20,
    },
    ringSection: {
      alignItems: "center",
      marginBottom: 24,
    },
    ringCenter: {
      alignItems: "center",
    },
    ringPercent: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
    },
    ringLabel: {
      fontSize: 13,
      color: colors.textMuted,
    },
    cardsRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 24,
    },
    card: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    miniCard: {
      flex: 1,
      alignItems: "center",
      gap: 4,
    },
    cardValue: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
    },
    miniCardValue: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
    },
    cardLabel: {
      fontSize: 11,
      color: colors.textMuted,
      textAlign: "center",
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    sectionTitle: {
      color: colors.text,
      fontWeight: "600",
      marginBottom: 14,
    },
    barsRow: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "flex-end",
      height: 130,
    },
    barGroup: {
      alignItems: "center",
      justifyContent: "flex-end",
      height: "100%",
    },
    barTrack: {
      width: 40,
      height: 80,
      borderRadius: 10,
      justifyContent: "flex-end",
      overflow: "hidden",
      backgroundColor: "transparent",
    },
    barFill: {
      width: "100%",
      borderRadius: 10,
    },
    barCount: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    barLabel: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    empty: {
      marginTop: 20,
      textAlign: "center",
      color: colors.textMuted,
    },
    hint: {
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 12,
      paddingHorizontal: 24,
      fontSize: 13,
      lineHeight: 18,
    },
  });

export default StatisticsScreen;
