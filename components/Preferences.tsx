import { createSettingsStyles } from "@/assets/styles/settings.styles";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Switch, Text, View } from "react-native";

const Preferences = () => {
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const settingsStyles = createSettingsStyles(colors);

  return (
    <View style={[settingsStyles.section, { backgroundColor: colors.surface }]}>
      <Text style={settingsStyles.sectionTitle}>Preferences</Text>

      <View style={settingsStyles.settingItem}>
        <View style={settingsStyles.settingLeft}>
          <View style={[settingsStyles.settingIcon, { backgroundColor: colors.primary + "20" }]}>
            <Ionicons
              name={isDarkMode ? "moon" : "sunny"}
              size={18}
              color={colors.primary}
            />
          </View>
          <Text style={settingsStyles.settingText}>Dark Mode</Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#ffffff"
        />
      </View>
    </View>
  );
};

export default Preferences;
