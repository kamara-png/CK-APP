import { createSettingsStyles } from "@/assets/styles/settings.styles";
import useTheme, { ACCENT_OPTIONS, ThemeAccent } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

const accentIcons: Record<ThemeAccent, keyof typeof Ionicons.glyphMap> = {
  default: "color-palette",
  duolingo: "leaf",
  instagram: "camera",
};

const Preferences = () => {
  const { colors, accent, setAccent, mode, toggleMode } = useTheme();
  const settingsStyles = createSettingsStyles(colors);
  const styles = createLocalStyles(colors);

  return (
    <View style={[settingsStyles.section, { backgroundColor: colors.surface }]}>
      <Text style={settingsStyles.sectionTitle}>Preferences</Text>

      <View style={settingsStyles.settingItem}>
        <View style={settingsStyles.settingLeft}>
          <View style={[settingsStyles.settingIcon, { backgroundColor: colors.primary + "20" }]}>
            <Ionicons
              name={mode === "dark" ? "moon" : "sunny"}
              size={18}
              color={colors.primary}
            />
          </View>
          <Text style={settingsStyles.settingText}>Dark Mode</Text>
        </View>
        <Switch
          value={mode === "dark"}
          onValueChange={toggleMode}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#ffffff"
        />
      </View>

      <Text style={styles.label}>Color theme</Text>
      <View style={styles.themeGrid}>
        {ACCENT_OPTIONS.map((option) => {
          const active = option.name === accent;
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
              onPress={() => setAccent(option.name)}
            >
              <Ionicons
                name={accentIcons[option.name]}
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
      <Text style={styles.subnote}>
        Each theme has its own light and dark look — the switch above applies to
        whichever one you pick.
      </Text>
    </View>
  );
};

const createLocalStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textMuted,
      marginTop: 16,
      marginBottom: 12,
    },
    themeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
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
    subnote: {
      marginTop: 12,
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 17,
    },
  });

export default Preferences;
