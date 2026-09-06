import ColorPicker from "@/components/ColorPicker";
import FormattingToolbar, { FormatAction } from "@/components/FormattingToolbar";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useConvex, useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const AUTOSAVE_DELAY_MS = 600;
const NOTE_COLORS = [null, "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const noteId = id as Id<"notes">;
  const { colors } = useTheme();
  const router = useRouter();
  const convex = useConvex();

  const note = useQuery(api.notes.getNote, { id: noteId });
  const updateNote = useMutation(api.notes.updateNote);
  const deleteNote = useMutation(api.notes.deleteNote);
  const createNote = useMutation(api.notes.createNote);
  const backlinks = useQuery(
    api.notes.getBacklinks,
    note ? { title: note.title } : "skip"
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [savedState, setSavedState] = useState<"saved" | "saving">("saved");
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [customPickerOpen, setCustomPickerOpen] = useState(false);
  const loadedRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestNoteRef = useRef({ title, content, color });

  useEffect(() => {
    latestNoteRef.current = { title, content, color };
  }, [title, content, color]);

  const saveLatestNote = useCallback(async () => {
    if (!loadedRef.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const latest = latestNoteRef.current;
    setSavedState("saving");
    await updateNote({ id: noteId, ...latest });
    setSavedState("saved");
  }, [noteId, updateNote]);

  useEffect(() => {
    if (note && !loadedRef.current) {
      setTitle(note.title);
      setContent(note.content);
      setColor(note.color);
      loadedRef.current = true;
    }
  }, [note]);

  useEffect(() => {
    if (!loadedRef.current) return;
    setSavedState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveLatestNote();
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, content, color, saveLatestNote]);

  const handleBack = async () => {
    await saveLatestNote();
    router.back();
  };

  const handleSaveAndClose = async () => {
    await saveLatestNote();
    router.back();
  };

  const applyFormat = (action: FormatAction) => {
    const { start, end } = selection;
    const before = content.slice(0, start);
    const selected = content.slice(start, end);
    const after = content.slice(end);

    let wrapBefore = "";
    let wrapAfter = "";
    let placeholder = "";
    switch (action) {
      case "bold":
        wrapBefore = "**";
        wrapAfter = "**";
        placeholder = "bold text";
        break;
      case "italic":
        wrapBefore = "*";
        wrapAfter = "*";
        placeholder = "italic text";
        break;
      case "heading":
        wrapBefore = "## ";
        placeholder = "Heading";
        break;
      case "checklist":
        wrapBefore = "- [ ] ";
        placeholder = "Task";
        break;
      case "bullet":
        wrapBefore = "- ";
        placeholder = "Item";
        break;
      case "link":
        wrapBefore = "[[";
        wrapAfter = "]]";
        placeholder = "Note title";
        break;
      case "code":
        wrapBefore = "`";
        wrapAfter = "`";
        placeholder = "code";
        break;
    }

    const middle = selected || placeholder;
    const inserted = wrapBefore + middle + wrapAfter;
    const cursor = (before + inserted).length;
    setContent(before + inserted + after);
    setSelection({ start: cursor, end: cursor });
  };

  const toggleChecklistLine = (lineIndex: number) => {
    const lines = content.split("\n");
    const line = lines[lineIndex];
    const match = line.match(/^(\s*-\s\[)( |x|X)(\]\s?.*)$/);
    if (!match) return;
    const newChar = match[2].toLowerCase() === "x" ? " " : "x";
    lines[lineIndex] = match[1] + newChar + match[3];
    setContent(lines.join("\n"));
  };

  const handleLinkPress = async (linkTitle: string) => {
    const existing = await convex.query(api.notes.findNoteByTitle, { title: linkTitle });
    if (existing) {
      router.push(`/notes/${existing._id}`);
      return;
    }
    Alert.alert("Note not found", `Create a new note called "${linkTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Create",
        onPress: async () => {
          const newId = await createNote({ title: linkTitle, content: "" });
          router.push(`/notes/${newId}`);
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert("Delete note?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (saveTimer.current) clearTimeout(saveTimer.current);
          await deleteNote({ id: noteId });
          router.back();
        },
      },
    ]);
  };

  const styles = createStyles(colors);

  if (note === undefined) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (note === null) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.textMuted }}>This note no longer exists.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={{ padding: 4 }}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <Text style={styles.savedLabel}>{savedState === "saving" ? "Saving…" : "Saved"}</Text>
            <TouchableOpacity
              onPress={handleSaveAndClose}
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.toolRow}>
          <View style={styles.modeSwitch}>
            <TouchableOpacity
              style={[styles.modeButton, mode === "write" && { backgroundColor: colors.primary }]}
              onPress={() => setMode("write")}
            >
              <Text style={{ color: mode === "write" ? "#fff" : colors.textMuted, fontWeight: "600" }}>
                Write
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === "preview" && { backgroundColor: colors.primary }]}
              onPress={() => setMode("preview")}
            >
              <Text style={{ color: mode === "preview" ? "#fff" : colors.textMuted, fontWeight: "600" }}>
                Preview
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.colorRow}>
            {NOTE_COLORS.map((c) => (
              <TouchableOpacity
                key={c ?? "none"}
                onPress={() => setColor(c ?? undefined)}
                style={[
                  styles.swatch,
                  {
                    backgroundColor: c ?? colors.bg,
                    borderColor: color === c ? colors.text : colors.border,
                    borderWidth: color === c ? 2 : 1,
                  },
                ]}
              >
                {!c && <Ionicons name="close" size={12} color={colors.textMuted} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setCustomPickerOpen(true)}
              style={[
                styles.swatch,
                styles.customSwatch,
                {
                  borderColor:
                    color && !NOTE_COLORS.includes(color) ? colors.text : colors.border,
                  borderWidth: color && !NOTE_COLORS.includes(color) ? 2 : 1,
                  backgroundColor:
                    color && !NOTE_COLORS.includes(color) ? color : "transparent",
                },
              ]}
            >
              <Ionicons name="color-palette-outline" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {mode === "write" && <FormattingToolbar colors={colors} onFormat={applyFormat} />}

        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={colors.textMuted}
          />

          {mode === "write" ? (
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
              placeholder="Start writing... use **bold**, [[links]], - [ ] checklists"
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
            />
          ) : (
            <View style={{ paddingVertical: 8 }}>
              <MarkdownRenderer
                content={content}
                colors={colors}
                onLinkPress={handleLinkPress}
                onToggleChecklist={toggleChecklistLine}
              />
              {content.trim() === "" && (
                <Text style={{ color: colors.textMuted }}>Nothing to preview yet.</Text>
              )}
            </View>
          )}

          {backlinks !== undefined && backlinks.length > 0 && (
            <View style={styles.backlinksSection}>
              <Text style={styles.backlinksTitle}>Linked from</Text>
              {backlinks.map((b) => (
                <TouchableOpacity key={b._id} onPress={() => router.push(`/notes/${b._id}`)}>
                  <Text style={styles.backlinkItem}>{b.title.trim() || "Untitled"}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      <Modal visible={customPickerOpen} transparent animationType="fade" onRequestClose={() => setCustomPickerOpen(false)}>
        <View style={styles.pickerBackdrop}>
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <View style={styles.pickerHeaderSide} />
              <Text style={styles.pickerTitle}>Pick a color</Text>
              <TouchableOpacity
                onPress={() => setCustomPickerOpen(false)}
                style={styles.pickerHeaderSide}
              >
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <ColorPicker
              value={color ?? colors.primary}
              onChange={(hex) => setColor(hex)}
              colors={colors}
            />
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: colors.primary }]}
              onPress={() => setCustomPickerOpen(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    savedLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    toolRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    modeSwitch: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 3,
      gap: 2,
    },
    modeButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    colorRow: {
      flexDirection: "row",
      gap: 7,
    },
    swatch: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    customSwatch: {
      borderStyle: "dashed",
    },
    pickerBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      padding: 24,
    },
    pickerCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
    },
    pickerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      width: "100%",
    },
    pickerTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      flex: 1,
      textAlign: "center",
    },
    pickerHeaderSide: { width: 22 },
    doneButton: {
      marginTop: 16,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 40,
      alignItems: "center",
    },
    doneButtonText: {
      color: "#fff",
      fontWeight: "700",
    },
    titleInput: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 10,
    },
    contentInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      paddingTop: 6,
      paddingBottom: 48,
      minHeight: 300,
    },
    saveButton: {
      borderRadius: 9,
      paddingHorizontal: 13,
      paddingVertical: 7,
    },
    saveButtonText: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "700",
    },
    deleteButton: { padding: 5 },
    backlinksSection: {
      marginTop: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: 40,
    },
    backlinksTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textMuted,
      marginBottom: 8,
    },
    backlinkItem: {
      color: colors.primary,
      fontSize: 14,
      marginBottom: 6,
      textDecorationLine: "underline",
    },
  });
