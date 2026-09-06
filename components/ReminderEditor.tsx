import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimeField from "@/components/DateTimeField";
import { ReminderSound } from "@/lib/notifications";
import { ColorScheme } from "@/hooks/useTheme";

interface ReminderEditorProps {
  visible: boolean;
  initialDate: Date;
  initialSound: ReminderSound;
  hasExistingReminder: boolean;
  colors: ColorScheme;
  onSave: (date: Date, sound: ReminderSound) => void;
  onClear: () => void;
  onClose: () => void;
}

const SOUND_OPTIONS: { value: ReminderSound; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "default", label: "Default", icon: "notifications" },
  { value: "alarm", label: "Alarm", icon: "alarm" },
  { value: "chime", label: "Chime", icon: "musical-notes" },
  { value: "silent", label: "Silent", icon: "notifications-off" },
];

export default function ReminderEditor({
  visible,
  initialDate,
  initialSound,
  hasExistingReminder,
  colors,
  onSave,
  onClear,
  onClose,
}: ReminderEditorProps) {
  const [date, setDate] = useState(initialDate);
  const [sound, setSound] = useState<ReminderSound>(initialSound);
  const styles = createStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Set reminder</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>When</Text>
          <DateTimeField
            value={date}
            onChange={setDate}
            color={colors.text}
            mutedColor={colors.textMuted}
            borderColor={colors.border}
          />

          <Text style={styles.label}>Sound</Text>
          <View style={styles.soundRow}>
            {SOUND_OPTIONS.map((option) => {
              const active = option.value === sound;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.soundOption,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary + "15" : "transparent",
                    },
                  ]}
                  onPress={() => setSound(option.value)}
                >
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={active ? colors.primary : colors.textMuted}
                  />
                  <Text style={{ color: active ? colors.primary : colors.text, fontWeight: "600" }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.note}>
            Apps can only use a small set of built-in alert sounds — not arbitrary
            ringtones from your device — that&apos;s an OS restriction, not this app.
          </Text>

          <View style={styles.actions}>
            {hasExistingReminder && (
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: colors.danger }]}
                onPress={onClear}
              >
                <Text style={{ color: colors.danger, fontWeight: "600" }}>Remove</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={() => onSave(date, sound)}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Save reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      padding: 24,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textMuted,
      marginBottom: 8,
      marginTop: 12,
    },
    soundRow: {
      flexDirection: "row",
      gap: 10,
    },
    soundOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1.5,
    },
    note: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 10,
      lineHeight: 15,
    },
    actions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 20,
    },
    actionButton: {
      borderWidth: 1.5,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
  });
