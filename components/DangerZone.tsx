import { api } from "@/convex/_generated/api";
import { createSettingsStyles } from "@/assets/styles/settings.styles";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

const DangerZone = () => {
  const { colors } = useTheme();
  const settingsStyles = createSettingsStyles(colors);
  const clearAllTodos = useMutation(api.todos.clearAllTodos);

  const handleClearAll = () => {
    Alert.alert(
      "Clear all todos?",
      "This will permanently delete every todo. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => clearAllTodos(),
        },
      ]
    );
  };

  return (
    <View style={[settingsStyles.section, { backgroundColor: colors.surface }]}>
      <Text style={settingsStyles.sectionTitleDanger}>Danger Zone</Text>

      <TouchableOpacity style={settingsStyles.actionButton} onPress={handleClearAll}>
        <View style={settingsStyles.actionLeft}>
          <View style={[settingsStyles.actionIcon, { backgroundColor: colors.danger + "20" }]}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </View>
          <Text style={settingsStyles.actionTextDanger}>Clear All Todos</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

export default DangerZone;
