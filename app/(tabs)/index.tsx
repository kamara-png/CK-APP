import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ReminderEditor from "@/components/ReminderEditor";
import useTheme from "@/hooks/useTheme";
import { useSlowLoadingHint } from "@/hooks/useSlowLoadingHint";
import {
  cancelTodoReminder,
  ensureNotificationPermission,
  ReminderSound,
  scheduleTodoReminder,
} from "@/lib/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
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

type ReminderTarget = { kind: "new" } | { kind: "existing"; id: Id<"todos"> };

export default function Index() {
  const { colors } = useTheme();
  const router = useRouter();
  const [text, setText] = useState("");

  const todos = useQuery(api.todos.getTodos);
  const addTodo = useMutation(api.todos.addTodo);
  const toggleTodo = useMutation(api.todos.toggleTodo);
  const deleteTodo = useMutation(api.todos.deleteTodo);
  const setReminder = useMutation(api.todos.setReminder);
  const slowLoading = useSlowLoadingHint(todos === undefined);

  // Reminder pending on the todo currently being composed (not saved yet).
  const [pendingReminder, setPendingReminder] = useState<{ date: Date; sound: ReminderSound } | null>(
    null
  );
  const [reminderTarget, setReminderTarget] = useState<ReminderTarget | null>(null);

  const handleAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    const reminderAt = pendingReminder?.date.getTime();
    const reminderSound = pendingReminder?.sound;
    setPendingReminder(null);

    const todoId = await addTodo({ text: trimmed, reminderAt, reminderSound });

    if (reminderAt && reminderSound) {
      const granted = await ensureNotificationPermission();
      if (granted) {
        await scheduleTodoReminder(todoId, trimmed, new Date(reminderAt), reminderSound);
      }
    }
  };

  const openReminderEditorForNew = () => setReminderTarget({ kind: "new" });
  const openReminderEditorForExisting = (id: Id<"todos">) =>
    setReminderTarget({ kind: "existing", id });

  const handleSaveReminder = async (date: Date, sound: ReminderSound) => {
    if (!reminderTarget) return;

    const granted = await ensureNotificationPermission();

    if (reminderTarget.kind === "new") {
      setPendingReminder({ date, sound });
    } else {
      const todo = todos?.find((t) => t._id === reminderTarget.id);
      await setReminder({ id: reminderTarget.id, reminderAt: date.getTime(), reminderSound: sound });
      if (granted) {
        await scheduleTodoReminder(reminderTarget.id, todo?.text ?? "Todo reminder", date, sound);
      }
    }
    setReminderTarget(null);
  };

  const handleClearReminder = async () => {
    if (!reminderTarget) return;

    if (reminderTarget.kind === "new") {
      setPendingReminder(null);
    } else {
      await setReminder({ id: reminderTarget.id, reminderAt: undefined, reminderSound: undefined });
      await cancelTodoReminder(reminderTarget.id);
    }
    setReminderTarget(null);
  };

  const styles = createStyles(colors);

  const editingExisting =
    reminderTarget?.kind === "existing" ? todos?.find((t) => t._id === reminderTarget.id) : undefined;
  const editorInitialDate =
    reminderTarget?.kind === "new"
      ? pendingReminder?.date ?? new Date(Date.now() + 60 * 60 * 1000)
      : editingExisting?.reminderAt
        ? new Date(editingExisting.reminderAt)
        : new Date(Date.now() + 60 * 60 * 1000);
  const editorInitialSound: ReminderSound =
    reminderTarget?.kind === "new"
      ? pendingReminder?.sound ?? "default"
      : (editingExisting?.reminderSound as ReminderSound) ?? "default";
  const editorHasExisting =
    reminderTarget?.kind === "new" ? pendingReminder !== null : Boolean(editingExisting?.reminderAt);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Streaks</Text>
        <TouchableOpacity onPress={() => router.push("/notes")}>
          <Ionicons name="document-text-outline" size={24} color={colors.text} />
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
        <TouchableOpacity
          style={[
            styles.reminderButton,
            pendingReminder && { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
          ]}
          onPress={openReminderEditorForNew}
        >
          <Ionicons
            name={pendingReminder ? "alarm" : "alarm-outline"}
            size={20}
            color={pendingReminder ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
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
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.rowText,
                      item.iscompleted && styles.rowTextDone,
                    ]}
                  >
                    {item.text}
                  </Text>
                  {item.reminderAt && (
                    <View style={styles.reminderChip}>
                      <Ionicons name="alarm-outline" size={12} color={colors.primary} />
                      <Text style={styles.reminderChipText}>
                        {new Date(item.reminderAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openReminderEditorForExisting(item._id as Id<"todos">)}
                style={{ paddingHorizontal: 6 }}
              >
                <Ionicons
                  name={item.reminderAt ? "alarm" : "alarm-outline"}
                  size={18}
                  color={item.reminderAt ? colors.primary : colors.textMuted}
                />
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

      <ReminderEditor
        visible={reminderTarget !== null}
        initialDate={editorInitialDate}
        initialSound={editorInitialSound}
        hasExistingReminder={editorHasExisting}
        colors={colors}
        onSave={handleSaveReminder}
        onClear={handleClearReminder}
        onClose={() => setReminderTarget(null)}
      />
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
    reminderButton: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      width: 44,
      alignItems: "center",
      justifyContent: "center",
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
      gap: 4,
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
    reminderChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
    },
    reminderChipText: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: "600",
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
