import { createSettingsStyles } from "@/assets/styles/settings.styles";
import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { exportAllData, pickBackupFile } from "@/lib/backup";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

const BackupExport = () => {
  const { colors } = useTheme();
  const settingsStyles = createSettingsStyles(colors);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const todos = useQuery(api.todos.getTodos);
  const notes = useQuery(api.notes.getNotes);
  const habits = useQuery(api.habits.getHabitsOverview);

  const importTodos = useMutation(api.todos.importTodos);
  const importNotes = useMutation(api.notes.importNotes);
  const importHabits = useMutation(api.habits.importHabits);

  const handleExport = async () => {
    if (!todos || !notes || !habits) return;
    setExporting(true);
    try {
      await exportAllData(todos, notes, habits);
    } catch {
      Alert.alert(
        "Export failed",
        "Something went wrong creating the backup file.",
      );
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const backup = await pickBackupFile();
      if (!backup) return; // cancelled

      Alert.alert(
        "Import backup?",
        `This will add ${backup.todos.length} todo(s), ${backup.notes.length} note(s), and ${backup.habits.length} habit(s) on top of what you already have. It won't remove anything.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Import",
            onPress: async () => {
              try {
                const [todoResult, noteResult, habitResult] = await Promise.all(
                  [
                    backup.todos.length
                      ? importTodos({ todos: backup.todos })
                      : { imported: 0 },
                    backup.notes.length
                      ? importNotes({ notes: backup.notes })
                      : { imported: 0 },
                    backup.habits.length
                      ? importHabits({ habits: backup.habits })
                      : { imported: 0 },
                  ],
                );
                Alert.alert(
                  "Import complete",
                  `Added ${todoResult.imported} todo(s), ${noteResult.imported} note(s), ${habitResult.imported} habit(s).`,
                );
              } catch (err) {
                Alert.alert(
                  "Import failed",
                  err instanceof Error
                    ? err.message
                    : "Something went wrong restoring the backup.",
                );
              }
            },
          },
        ],
      );
    } catch (err) {
      Alert.alert(
        "Couldn't read that file",
        err instanceof Error
          ? err.message
          : "Something went wrong reading the backup file.",
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <View style={[settingsStyles.section, { backgroundColor: colors.surface }]}>
      <Text style={settingsStyles.sectionTitle}>Backup</Text>

      <TouchableOpacity
        style={settingsStyles.actionButton}
        onPress={handleImport}
        disabled={importing}
      >
        <View style={settingsStyles.actionLeft}>
          <View
            style={[
              settingsStyles.actionIcon,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons name="cloud-upload" size={18} color={colors.primary} />
          </View>
          <Text style={{ color: colors.text, fontWeight: "600" }}>
            {importing ? "Reading file…" : "Import data"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[settingsStyles.actionButton, { borderBottomWidth: 0 }]}
        onPress={handleExport}
        disabled={exporting}
      >
        <View style={settingsStyles.actionLeft}>
          <View
            style={[
              settingsStyles.actionIcon,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons name="download" size={18} color={colors.primary} />
          </View>
          <Text style={{ color: colors.text, fontWeight: "600" }}>
            {exporting ? "Preparing your stuff…" : "Export all data"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

export default BackupExport;
