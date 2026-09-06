import { createSettingsStyles } from "@/assets/styles/settings.styles";
import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { exportAllData } from "@/lib/backup";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

const BackupExport = () => {
  const { colors } = useTheme();
  const settingsStyles = createSettingsStyles(colors);
  const [exporting, setExporting] = useState(false);

  const todos = useQuery(api.todos.getTodos);
  const notes = useQuery(api.notes.getNotes);
  const habits = useQuery(api.habits.getHabitsOverview);

  const handleExport = async () => {
    if (!todos || !notes || !habits) return;
    setExporting(true);
    try {
      await exportAllData(todos, notes, habits);
    } catch {
      Alert.alert("Export failed", "Something went wrong creating the backup file.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={[settingsStyles.section, { backgroundColor: colors.surface }]}>
      <Text style={settingsStyles.sectionTitle}>Backup</Text>
      <TouchableOpacity
        style={settingsStyles.actionButton}
        onPress={handleExport}
        disabled={exporting}
      >
        <View style={settingsStyles.actionLeft}>
          <View style={[settingsStyles.actionIcon, { backgroundColor: colors.primary + "20" }]}>
            <Ionicons name="download" size={18} color={colors.primary} />
          </View>
          <Text style={{ color: colors.text, fontWeight: "600" }}>
            {exporting ? "Preparing…" : "Export all data"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

export default BackupExport;
