import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ColorScheme } from "@/hooks/useTheme";

interface UndoToastProps {
  visible: boolean;
  message: string;
  colors: ColorScheme;
  onUndo: () => void;
}

export default function UndoToast({ visible, message, colors, onUndo }: UndoToastProps) {
  if (!visible) return null;
  const styles = createStyles(colors);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.toast}>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={onUndo}>
          <Text style={[styles.undo, { color: colors.primary }]}>UNDO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 24,
      alignItems: "center",
    },
    toast: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.isDark ? "#333333" : "#1e1e1e",
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      width: "100%",
    },
    message: {
      color: "#fff",
      fontSize: 14,
      flex: 1,
    },
    undo: {
      fontWeight: "700",
      fontSize: 13,
      marginLeft: 12,
    },
  });
