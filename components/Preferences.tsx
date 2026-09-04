import { createSettingsStyles } from "@/assets/styles/settings.styles";
import useTheme, { THEME_OPTIONS, ThemeName } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const themeIcons: Record<ThemeName, keyof typeof Ionicons.glyphMap> = {
  light: "sunny",
  dark: "moon",
  duolingo: "balloon",
  instagram: "camera",
};

const Preferences = () => {
  const { colors, themeName, setThemeName } = useTheme();
  const settingsStyles = createSettingsStyles(colors);
  const styles = createLocalStyles(colors);

  return (
    <View style={[settingsStyles.section, { backgroundColor: colors.surface }]}>
      <Text style={settingsStyles.sectionTitle}>Preferences</Text>

      <Text style={styles.label}>Theme</Text>
      <View style={styles.themeGrid}>
        {THEME_OPTIONS.map((option) => {
          const active = option.name === themeName;
          return (
            <TouchableOpacity
              key={option.name}
              style={[
                styles.themeOption,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primary + "15" : colors.bg,
                },
              ]}
              onPress={() => setThemeName(option.name)}
            >
              <Ionicons
                name={themeIcons[option.name]}
                size={20}
                color={active ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.themeLabel,
                  { color: active ? colors.primary : colors.text },
                ]}
              >
                {option.label}
              </Text>
              {active && (
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const createLocalStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textMuted,
      marginBottom: 12,
    },
    themeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    themeOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1.5,
      minWidth: "45%",
    },
    themeLabel: {
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
    },
  });

export default Preferences;
