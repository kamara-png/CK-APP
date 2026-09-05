import { api } from "@/convex/_generated/api";
import ProgressRing from "@/components/ProgressRing";
import SwipeTabScreen from "@/components/SwipeTabScreen";
import WeeklyActivityChart from "@/components/WeeklyActivityChart";
import useTheme from "@/hooks/useTheme";
import { useSlowLoadingHint } from "@/hooks/useSlowLoadingHint";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const StatisticsScreen = () => {
  const { colors } = useTheme();
  const todos = useQuery(api.todos.getTodos);
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

  const cards = [
    { label: "Total", value: total, icon: "list-outline", color: colors.primary },
    { label: "Completed", value: completed, icon: "checkmark-circle-outline", color: colors.success },
    { label: "Remaining", value: remaining, icon: "time-outline", color: colors.warning },
  ] as const;

  return (
    <SwipeTabScreen path="/statistics">
    <View style={styles.container}>
      <Text style={styles.title}>Statistics</Text>

      {total === 0 ? (
        <Text style={styles.empty}>
          Add some todos on the Streaks tab to see stats here.
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
        </>
      )}
    </View>
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
    cardValue: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
    },
    cardLabel: {
      fontSize: 12,
      color: colors.textMuted,
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
