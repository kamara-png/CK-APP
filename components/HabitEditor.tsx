import { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ColorScheme } from "@/hooks/useTheme";

const PRESET_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

interface HabitEditorProps {
  visible: boolean;
  colors: ColorScheme;
  onSave: (name: string, color: string) => void;
  onClose: () => void;
}

export default function HabitEditor({ visible, colors, onSave, onClose }: HabitEditorProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const styles = createStyles(colors);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed, color);
    setName("");
    setColor(PRESET_COLORS[0]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>New streak</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>What are you tracking?</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Morning run, Read, Meditate"
            placeholderTextColor={colors.textMuted}
            autoFocus
          />

          <Text style={styles.label}>Color</Text>
          <View style={styles.colorRow}>
            {PRESET_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.swatch,
                  { backgroundColor: c },
                  color === c && styles.swatchActive,
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Start streak</Text>
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
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textMuted,
      marginBottom: 8,
      marginTop: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: colors.text,
      backgroundColor: colors.backgrounds.input,
    },
    colorRow: {
      flexDirection: "row",
      gap: 12,
    },
    swatch: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    swatchActive: {
      borderWidth: 3,
      borderColor: colors.text,
    },
    saveButton: {
      marginTop: 24,
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
