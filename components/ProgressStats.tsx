import { createSettingsStyles } from "@/assets/styles/settings.styles";
import { api } from "@/convex/_generated/api";
import { useSlowLoadingHint } from "@/hooks/useSlowLoadingHint";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { ActivityIndicator, Text, View } from "react-native";

const ProgressStats = () => {
  const { colors } = useTheme();
  const settingsStyles = createSettingsStyles(colors);
  const todos = useQuery(api.todos.getTodos);
  const slowLoading = useSlowLoadingHint(todos === undefined);

  if (todos === undefined) {
    return (
      <View style={[settingsStyles.section, { backgroundColor: colors.surface, alignItems: "center" }]}>
        <ActivityIndicator color={colors.primary} />
        {slowLoading && (
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8, textAlign: "center" }}>
            Not connecting? Check `npx convex dev` is running.
          </Text>
        )}
      </View>
    );
  }

  const total = todos.length;
  const completed = todos.filter((t) => t.iscompleted).length;
  const remaining = total - completed;

  const stats = [
    {
      label: "Total",
      value: total,
      icon: "list" as const,
      color: colors.primary,
    },
    {
      label: "Completed",
      value: completed,
      icon: "checkmark-circle" as const,
      color: colors.success,
    },
    {
      label: "Remaining",
      value: remaining,
      icon: "time" as const,
      color: colors.warning,
    },
  ];

  return (
    <View style={[settingsStyles.section, { backgroundColor: colors.surface }]}>
      <Text style={settingsStyles.sectionTitle}>Progress</Text>
      <View style={settingsStyles.statsContainer}>
        {stats.map((stat) => (
          <View
            key={stat.label}
            style={[
              settingsStyles.statCard,
              { backgroundColor: colors.bg, borderLeftColor: stat.color },
            ]}
          >
            <View style={settingsStyles.statIconContainer}>
              <View style={[settingsStyles.statIcon, { backgroundColor: stat.color + "20" }]}>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
              </View>
            </View>
            <View>
              <Text style={settingsStyles.statNumber}>{stat.value}</Text>
              <Text style={settingsStyles.statLabel}>{stat.label}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ProgressStats;
