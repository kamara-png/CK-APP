import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimeField from "@/components/DateTimeField";
import { ReminderSound } from "@/lib/notifications";
import { ColorScheme } from "@/hooks/useTheme";

const SOUND_OPTIONS: { value: ReminderSound; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "default", label: "Default", icon: "notifications" },
  { value: "silent", label: "Silent", icon: "notifications-off" },
];

interface TodoEditorProps {
  visible: boolean;
  initialText: string;
  initialReminderAt?: number;
  initialReminderSound?: ReminderSound;
  colors: ColorScheme;
  onSave: (text: string, reminderAt?: number, reminderSound?: ReminderSound) => void;
  onClose: () => void;
}

export default function TodoEditor({
  visible,
  initialText,
  initialReminderAt,
  initialReminderSound,
  colors,
  onSave,
  onClose,
}: TodoEditorProps) {
  const [text, setText] = useState(initialText);
  const [reminderOn, setReminderOn] = useState(Boolean(initialReminderAt));
  const [date, setDate] = useState(
    initialReminderAt ? new Date(initialReminderAt) : new Date(Date.now() + 60 * 60 * 1000)
  );
  const [sound, setSound] = useState<ReminderSound>(initialReminderSound ?? "default");
  const styles = createStyles(colors);

  useEffect(() => {
    if (visible) {
      setText(initialText);
      setReminderOn(Boolean(initialReminderAt));
      setDate(initialReminderAt ? new Date(initialReminderAt) : new Date(Date.now() + 60 * 60 * 1000));
      setSound(initialReminderSound ?? "default");
    }
  }, [visible, initialText, initialReminderAt, initialReminderSound]);

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSave(trimmed, reminderOn ? date.getTime() : undefined, reminderOn ? sound : undefined);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit todo</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Todo text"
            placeholderTextColor={colors.textMuted}
            autoFocus
            multiline
          />

          <TouchableOpacity
            style={styles.reminderToggle}
            onPress={() => setReminderOn((v) => !v)}
          >
            <Ionicons
              name={reminderOn ? "alarm" : "alarm-outline"}
              size={18}
              color={reminderOn ? colors.primary : colors.textMuted}
            />
            <Text style={{ color: reminderOn ? colors.primary : colors.textMuted, fontWeight: "600" }}>
              {reminderOn ? "Reminder on" : "Add a reminder"}
            </Text>
          </TouchableOpacity>

          {reminderOn && (
            <>
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
                        size={16}
                        color={active ? colors.primary : colors.textMuted}
                      />
                      <Text style={{ color: active ? colors.primary : colors.text, fontWeight: "600" }}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save changes</Text>
          </TouchableOpacity>
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
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: colors.text,
      backgroundColor: colors.backgrounds.editInput,
      minHeight: 60,
      textAlignVertical: "top",
    },
    reminderToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 16,
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
    saveButton: {
      marginTop: 20,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
    },
    saveButtonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 15,
    },
  });
