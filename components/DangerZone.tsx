import { createSettingsStyles } from "@/assets/styles/settings.styles";
import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

const DangerZone = () => {
  const { colors } = useTheme();
  const settingsStyles = createSettingsStyles(colors);
  const clearAllTodos = useMutation(api.todos.clearAllTodos);
  const clearAllNotes = useMutation(api.notes.clearAllNotes);
  const clearAllHabits = useMutation(api.habits.clearAllHabits);

  const confirmClear = (
    label: string,
    message: string,
    onConfirm: () => void
  ) => {
    Alert.alert(label, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Clear All", style: "destructive", onPress: onConfirm },
    ]);
  };

  const handleClearTodos = () =>
    confirmClear(
      "Clear all todos?",
      "This will permanently delete every todo. This can't be undone.",
      () => clearAllTodos()
    );

  const handleClearNotes = () =>
    confirmClear(
      "Clear all notes?",
      "This will permanently delete every note. This can't be undone.",
      () => clearAllNotes()
    );

  const handleClearHabits = () =>
    confirmClear(
      "Clear all streaks?",
      "This will permanently delete every habit and its check-in history. This can't be undone.",
      () => clearAllHabits()
    );

  return (
    <View style={[settingsStyles.section, { backgroundColor: colors.surface }]}>
      <Text style={settingsStyles.sectionTitleDanger}>Danger Zone</Text>

      <TouchableOpacity style={settingsStyles.actionButton} onPress={handleClearTodos}>
        <View style={settingsStyles.actionLeft}>
          <View style={[settingsStyles.actionIcon, { backgroundColor: colors.danger + "20" }]}>
            <Ionicons name="checkbox" size={18} color={colors.danger} />
          </View>
          <Text style={settingsStyles.actionTextDanger}>Clear All Todos</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={settingsStyles.actionButton} onPress={handleClearNotes}>
        <View style={settingsStyles.actionLeft}>
          <View style={[settingsStyles.actionIcon, { backgroundColor: colors.danger + "20" }]}>
            <Ionicons name="document-text" size={18} color={colors.danger} />
          </View>
          <Text style={settingsStyles.actionTextDanger}>Clear All Notes</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={settingsStyles.actionButton} onPress={handleClearHabits}>
        <View style={settingsStyles.actionLeft}>
          <View style={[settingsStyles.actionIcon, { backgroundColor: colors.danger + "20" }]}>
            <Ionicons name="flame" size={18} color={colors.danger} />
          </View>
          <Text style={settingsStyles.actionTextDanger}>Clear All Streaks</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

export default DangerZone;
