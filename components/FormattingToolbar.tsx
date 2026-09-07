import { ColorScheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

export type FormatAction = "bold" | "italic" | "heading" | "checklist" | "bullet" | "link" | "code";

interface FormattingToolbarProps {
  colors: ColorScheme;
  onFormat: (action: FormatAction) => void;
}

const ICON_BUTTONS: { action: FormatAction; icon: keyof typeof Ionicons.glyphMap }[] = [
  { action: "heading", icon: "text" },
  { action: "checklist", icon: "checkbox" },
  { action: "bullet", icon: "list" },
  { action: "link", icon: "link" },
  { action: "code", icon: "code-slash" },
];

export default function FormattingToolbar({ colors, onFormat }: FormattingToolbarProps) {
  const styles = createStyles(colors);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => onFormat("bold")}>
        <Text style={{ color: colors.text, fontWeight: "800", fontSize: 16 }}>B</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => onFormat("italic")}>
        <Text style={{ color: colors.text, fontStyle: "italic", fontWeight: "600", fontSize: 16 }}>
          I
        </Text>
      </TouchableOpacity>
      {ICON_BUTTONS.map((b) => (
        <TouchableOpacity key={b.action} style={styles.button} onPress={() => onFormat(b.action)}>
          <Ionicons name={b.icon} size={19} color={colors.text} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      paddingVertical: 8,
    },
    button: {
      paddingHorizontal: 12,
      justifyContent: "center",
    },
  });
