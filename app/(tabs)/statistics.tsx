import { api } from "@/convex/_generated/api";
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
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.primary} />
        {slowLoading && (
          <Text style={styles.hint}>
            Still connecting — make sure `npx convex dev` is running and
            EXPO_PUBLIC_CONVEX_URL is set correctly, then restart Expo.
          </Text>
        )}
      </View>
    );
  }

  const total = todos.length;
  const completed = todos.filter((t) => t.iscompleted).length;
  const remaining = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const cards = [
    { label: "Total", value: total, icon: "list-outline", color: colors.primary },
    { label: "Completed", value: completed, icon: "checkmark-circle-outline", color: colors.success },
    { label: "Remaining", value: remaining, icon: "time-outline", color: colors.warning },
  ] as const;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistics</Text>

      <View style={styles.cardsRow}>
        {cards.map((card) => (
          <View key={card.label} style={styles.card}>
            <Ionicons name={card.icon} size={22} color={card.color} />
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Completion rate</Text>
          <Text style={styles.progressPercent}>{rate}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${rate}%`, backgroundColor: colors.success },
            ]}
          />
        </View>
      </View>

      {total === 0 && (
        <Text style={styles.empty}>
          Add some todos on the Streaks tab to see stats here.
        </Text>
      )}
    </View>
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
    progressSection: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    progressLabel: {
      color: colors.text,
      fontWeight: "600",
    },
    progressPercent: {
      color: colors.textMuted,
    },
    progressTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 4,
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