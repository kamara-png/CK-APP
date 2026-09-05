import { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ColorScheme } from "@/hooks/useTheme";

interface AddTodoModalProps {
  visible: boolean;
  colors: ColorScheme;
  onSubmit: (text: string) => void;
  onClose: () => void;
}

export default function AddTodoModal({ visible, colors, onSubmit, onClose }: AddTodoModalProps) {
  const [text, setText] = useState("");
  const styles = createStyles(colors);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    onSubmit(trimmed);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>New todo</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="What do you need to do?"
            placeholderTextColor={colors.textMuted}
            autoFocus
            multiline
            onSubmitEditing={handleSubmit}
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Add todo</Text>
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
