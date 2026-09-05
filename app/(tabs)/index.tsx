import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import AddTodoModal from "@/components/AddTodoModal";
import ReminderEditor from "@/components/ReminderEditor";
import SwipeableRow from "@/components/SwipeableRow";
import SwipeTabScreen from "@/components/SwipeTabScreen";
import TodoEditor from "@/components/TodoEditor";
import UndoToast from "@/components/UndoToast";
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
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ReminderTarget = { kind: "existing"; id: Id<"todos"> };

const UNDO_WINDOW_MS = 1000;

function dayKey(ms: number) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(ms: number) {
  const d = new Date(ms);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(ms) === dayKey(today.getTime())) return "Today";
  if (dayKey(ms) === dayKey(yesterday.getTime())) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Index() {
  const { colors } = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Id<"todos"> | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<Id<"todos"> | null>(null);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const todos = useQuery(api.todos.getTodos);
  const addTodo = useMutation(api.todos.addTodo);
  const toggleTodo = useMutation(api.todos.toggleTodo);
  const deleteTodo = useMutation(api.todos.deleteTodo);
  const updateTodo = useMutation(api.todos.updateTodo);
  const setReminder = useMutation(api.todos.setReminder);
  const slowLoading = useSlowLoadingHint(todos === undefined);

  const [reminderTarget, setReminderTarget] = useState<ReminderTarget | null>(null);

  const visibleTodos = useMemo(() => {
    if (!todos) return [];
    const q = search.trim().toLowerCase();
    const base = q ? todos.filter((t) => t.text.toLowerCase().includes(q)) : todos;
    return base.filter((t) => t._id !== pendingDeleteId);
  }, [todos, search, pendingDeleteId]);

  const handleCreate = async (text: string) => {
    setAddModalOpen(false);
    const todoId = await addTodo({ text });
    // Bake the reminder into the creation flow: offer to set one right after.
    setReminderTarget({ kind: "existing", id: todoId });
  };

  const handleSaveReminder = async (date: Date, sound: ReminderSound) => {
    if (!reminderTarget) return;
    const granted = await ensureNotificationPermission();
    const todo = todos?.find((t) => t._id === reminderTarget.id);
    await setReminder({ id: reminderTarget.id, reminderAt: date.getTime(), reminderSound: sound });
    if (granted) {
      await scheduleTodoReminder(reminderTarget.id, todo?.text ?? "Todo reminder", date, sound);
    }
    setReminderTarget(null);
  };

  const handleClearReminder = async () => {
    if (!reminderTarget) return;
    await setReminder({ id: reminderTarget.id, reminderAt: undefined, reminderSound: undefined });
    await cancelTodoReminder(reminderTarget.id);
    setReminderTarget(null);
  };

  const handleSwipeOrIconDelete = (id: Id<"todos">) => {
    // Optimistically hide it, give a short window to undo before the real delete.
    setPendingDeleteId(id);
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    deleteTimer.current = setTimeout(() => {
      deleteTodo({ id });
      setPendingDeleteId(null);
    }, UNDO_WINDOW_MS);
  };

  const handleUndoDelete = () => {
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    setPendingDeleteId(null);
  };

  const handleSaveEdit = async (
    text: string,
    reminderAt?: number,
    reminderSound?: ReminderSound
  ) => {
    if (!editTarget) return;
    await updateTodo({ id: editTarget, text });
    await setReminder({ id: editTarget, reminderAt, reminderSound });
    if (reminderAt && reminderSound) {
      const granted = await ensureNotificationPermission();
      if (granted) await scheduleTodoReminder(editTarget, text, new Date(reminderAt), reminderSound);
    } else {
      await cancelTodoReminder(editTarget);
    }
    setEditTarget(null);
  };

  const styles = createStyles(colors);
  const editingTodo = editTarget ? todos?.find((t) => t._id === editTarget) : undefined;

  return (
    <SwipeTabScreen path="/">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Todos</Text>
          <TouchableOpacity onPress={() => router.push("/notes")}>
            <Ionicons name="document-text-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search todos..."
            placeholderTextColor={colors.textMuted}
          />
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
            data={visibleTodos}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {todos.length === 0 ? "No todos yet — tap + to add one." : "No matches."}
              </Text>
            }
            renderItem={({ item, index }) => {
              const prev = visibleTodos[index - 1];
              const showDateHeader = !prev || dayKey(prev._creationTime) !== dayKey(item._creationTime);

              return (
                <View>
                  {showDateHeader && (
                    <Text style={[styles.dateHeader, index > 0 && { marginTop: 20 }]}>
                      {dayLabel(item._creationTime)}
                    </Text>
                  )}
                  <SwipeableRow
                    style={{ marginBottom: 8 }}
                    completeColor={colors.success}
                    deleteColor={colors.danger}
                    onSwipeComplete={() => toggleTodo({ id: item._id as Id<"todos"> })}
                    onSwipeDelete={() => handleSwipeOrIconDelete(item._id as Id<"todos">)}
                  >
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
                            style={[styles.rowText, item.iscompleted && styles.rowTextDone]}
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
                        onPress={() => setEditTarget(item._id as Id<"todos">)}
                        style={{ paddingHorizontal: 6 }}
                      >
                        <Ionicons name="pencil-outline" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleSwipeOrIconDelete(item._id as Id<"todos">)}
                      >
                        <Ionicons name="trash-outline" size={20} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </SwipeableRow>
                </View>
              );
            }}
          />
        )}

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => setAddModalOpen(true)}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>

        <UndoToast
          visible={pendingDeleteId !== null}
          message="Todo deleted"
          colors={colors}
          onUndo={handleUndoDelete}
        />
      </View>

      <AddTodoModal
        visible={addModalOpen}
        colors={colors}
        onSubmit={handleCreate}
        onClose={() => setAddModalOpen(false)}
      />

      <ReminderEditor
        visible={reminderTarget !== null}
        initialDate={new Date(Date.now() + 60 * 60 * 1000)}
        initialSound="default"
        hasExistingReminder={false}
        colors={colors}
        onSave={handleSaveReminder}
        onClear={handleClearReminder}
        onClose={() => setReminderTarget(null)}
      />

      <TodoEditor
        visible={editTarget !== null}
        initialText={editingTodo?.text ?? ""}
        initialReminderAt={editingTodo?.reminderAt}
        initialReminderSound={editingTodo?.reminderSound as ReminderSound | undefined}
        colors={colors}
        onSave={handleSaveEdit}
        onClose={() => setEditTarget(null)}
      />
    </SwipeTabScreen>
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
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.backgrounds.input,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 8,
      color: colors.text,
    },
    list: {
      paddingBottom: 100,
    },
    dateHeader: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 8,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
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
    fab: {
      position: "absolute",
      right: 20,
      bottom: 30,
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: "center",
      justifyContent: "center",
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
    },
  });
