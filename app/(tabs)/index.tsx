import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import useTheme from "@/hooks/useTheme";
import { useSlowLoadingHint } from "@/hooks/useSlowLoadingHint";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const [text, setText] = useState("");

  const todos = useQuery(api.todos.getTodos);
  const addTodo = useMutation(api.todos.addTodo);
  const toggleTodo = useMutation(api.todos.toggleTodo);
  const deleteTodo = useMutation(api.todos.deleteTodo);
  const slowLoading = useSlowLoadingHint(todos === undefined);

  const handleAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    await addTodo({ text: trimmed });
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Streaks</Text>
        <TouchableOpacity onPress={toggleDarkMode}>
          <Ionicons
            name={isDarkMode ? "sunny-outline" : "moon-outline"}
            size={22}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Add a todo..."
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {todos === undefined ? (
        <View style={{ marginTop: 24, alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
          {slowLoading && (
            <Text style={styles.hint}>
              Still connecting — make sure `npx convex dev` is running and
              EXPO_PUBLIC_CONVEX_URL is set correctly, then restart Expo.
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No todos yet — add one above.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.rowLeft}
                onPress={() => toggleTodo({ id: item._id as Id<"todos"> })}
              >
                <View
                  style={[
                    styles.checkbox,
                    item.iscompleted
                      ? { backgroundColor: colors.success, borderColor: colors.success }
                      : { borderColor: colors.textMuted },
                  ]}
                >
                  {item.iscompleted && (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  )}
                </View>
                <Text
                  style={[
                    styles.rowText,
                    item.iscompleted && styles.rowTextDone,
                  ]}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteTodo({ id: item._id as Id<"todos"> })}
              >
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
      paddingHorizontal: 16,
      paddingTop: 60,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
    },
    inputRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
    },
    input: {
      flex: 1,
      backgroundColor: colors.backgrounds.input,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      width: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    list: {
      paddingBottom: 24,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 8,
    },
    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    checkbox: {
      width: 28,
      height: 28,
      borderRadius: 9,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    rowText: {
      color: colors.text,
      fontSize: 16,
      flexShrink: 1,
    },
    rowTextDone: {
      textDecorationLine: "line-through",
      color: colors.textMuted,
    },
    empty: {
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 40,
    },
    hint: {
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 12,
      paddingHorizontal: 24,
      fontSize: 13,
      lineHeight: 18,
    },
  });