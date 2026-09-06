import DateTimeField from "@/components/DateTimeField";
import { ColorScheme } from "@/hooks/useTheme";
import { ReminderSound } from "@/lib/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddTodoModalProps {
  visible: boolean;
  colors: ColorScheme;
  onSubmit: (text: string, reminderAt?: number, reminderSound?: ReminderSound) => void;
  onClose: () => void;
}

export default function AddTodoModal({ visible, colors, onSubmit, onClose }: AddTodoModalProps) {
  const [text, setText] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState(
    () => new Date(Date.now() + 60 * 60 * 1000)
  );
  const styles = createStyles(colors);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    onSubmit(
      trimmed,
      reminderEnabled ? reminderDate.getTime() : undefined,
      reminderEnabled ? "alarm" : undefined
    );
    setReminderEnabled(false);
    setReminderDate(new Date(Date.now() + 60 * 60 * 1000));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerSide} />
            <Text style={styles.title}>New todo</Text>
            <TouchableOpacity onPress={onClose} style={styles.headerSide}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Leo tufanye?"
            placeholderTextColor={colors.textMuted}
            autoFocus
            multiline
            onSubmitEditing={handleSubmit}
          />
          <View style={styles.reminderRow}>
            <View style={styles.reminderLabelRow}>
              <Ionicons
                name={reminderEnabled ? "alarm" : "alarm-outline"}
                size={20}
                color={reminderEnabled ? colors.primary : colors.textMuted}
              />
              <View>
                <Text style={styles.reminderTitle}>Set an alarm</Text>
                <Text style={styles.reminderHint}>Get notified when it is time</Text>
              </View>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          {reminderEnabled && (
            <DateTimeField
              value={reminderDate}
              onChange={setReminderDate}
              color={colors.text}
              mutedColor={colors.textMuted}
              borderColor={colors.border}
            />
          )}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Add todo bossi</Text>
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
      flex: 1,
      textAlign: "center",
    },
    headerSide: { width: 22 },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: colors.text,
      backgroundColor: colors.backgrounds.editInput,
      minHeight: 60,
      textAlignVertical: "center",
    },
    reminderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 16,
      marginBottom: 12,
    },
    reminderLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    reminderTitle: {
      color: colors.text,
      fontWeight: "700",
      fontSize: 14,
    },
    reminderHint: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    button: {
      marginTop: 20,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 15,
    },
  });
