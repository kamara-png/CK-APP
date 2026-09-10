import { createSettingsStyles } from "@/assets/styles/settings.styles";
import useTheme, { ACCENT_OPTIONS, ThemeAccent } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useState } from "react";
import { FlatList, Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

const accentIcons: Record<ThemeAccent, keyof typeof Ionicons.glyphMap> = {
  default: "color-palette",
  duolingo: "leaf",
  instagram: "camera",
  obsidian: "diamond",
  substack: "mail",
  twitter: "at",
  spotify: "musical-notes",
  notion: "document-text",
};

const Preferences = () => {
  const { colors, accent, setAccent, mode, toggleMode } = useTheme();
  const settingsStyles = createSettingsStyles(colors);
  const styles = createLocalStyles(colors);
  const [pickerOpen, setPickerOpen] = useState(false);

  const activeOption = ACCENT_OPTIONS.find((o) => o.name === accent) ?? ACCENT_OPTIONS[0];

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

      <TouchableOpacity
        style={[settingsStyles.settingItem, { borderBottomWidth: 0 }]}
        onPress={() => setPickerOpen(true)}
      >
        <View style={settingsStyles.settingLeft}>
          <View style={[settingsStyles.settingIcon, { backgroundColor: colors.primary + "20" }]}>
            <Ionicons name={accentIcons[accent]} size={18} color={colors.primary} />
          </View>
          <Text style={settingsStyles.settingText}>Color theme</Text>
        </View>
        <View style={styles.currentValueRow}>
          <Text style={styles.currentValueText}>{activeOption.label}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setPickerOpen(false)}
        >
          <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Color theme</Text>
            <Text style={styles.sheetSubtitle}>
              Each theme has its own light and dark look, the Dark Mode switch
              changes which one is shown.
            </Text>
            <FlatList
              data={ACCENT_OPTIONS}
              keyExtractor={(item) => item.name}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => {
                const active = item.name === accent;
                return (
                  <TouchableOpacity
                    style={[styles.row, active && { backgroundColor: colors.primary + "12" }]}
                    onPress={() => {
                      setAccent(item.name);
                      setPickerOpen(false);
                    }}
                  >
                    <View style={[styles.swatchDot, { backgroundColor: active ? colors.primary : colors.bg }]}>
                      <Ionicons
                        name={accentIcons[item.name]}
                        size={16}
                        color={active ? "#fff" : colors.textMuted}
                      />
                    </View>
                    <Text style={[styles.rowLabel, { color: active ? colors.primary : colors.text }]}>
                      {item.label}
                    </Text>
                    {active && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const createLocalStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    currentValueRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    currentValueText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.textMuted,
    },
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.2)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 32,
      maxHeight: "75%",
    },
    sheetHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: 14,
    },
    sheetTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 4,
    },
    sheetSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 17,
      marginBottom: 12,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: 12,
    },
    swatchDot: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rowLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
    },
  });

export default Preferences;
