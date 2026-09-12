import { createModalStyles, createSheetStyles } from "@/assets/styles/common";
import ColorPicker from "@/components/ColorPicker";
import EdgeSwipeBack from "@/components/EdgeSwipeBack";
import FormattingToolbar, {
  FormatAction,
} from "@/components/FormattingToolbar";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useConvex, useMutation, useQuery } from "convex/react";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  InputAccessoryView,
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
const NOTE_COLORS = [
  null,
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];
const FORMAT_TOOLBAR_ID = "note-editor-format-toolbar";

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
    note ? { title: note.title } : "skip",
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [savedState, setSavedState] = useState<"saved" | "saving">("saved");
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [customPickerOpen, setCustomPickerOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
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
    const existing = await convex.query(api.notes.findNoteByTitle, {
      title: linkTitle,
    });
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

  const modalStyles = createModalStyles(colors);
  const sheetStyles = createSheetStyles(colors);
  const styles = createStyles(colors);

  if (note === undefined) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (note === null) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: colors.textMuted }}>
          This note no longer exists.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <EdgeSwipeBack />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.headerIconButton}
          >
            <Ionicons name="chevron-back" size={26} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.modeSwitch}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === "write" && { backgroundColor: colors.primary },
              ]}
              onPress={() => setMode("write")}
            >
              <Text
                style={{
                  color: mode === "write" ? "#fff" : colors.textMuted,
                  fontWeight: "600",
                }}
              >
                Write
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === "preview" && { backgroundColor: colors.primary },
              ]}
              onPress={() => setMode("preview")}
            >
              <Text
                style={{
                  color: mode === "preview" ? "#fff" : colors.textMuted,
                  fontWeight: "600",
                }}
              >
                Preview
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => setOptionsOpen(true)}
            style={styles.headerIconButton}
          >
            <Ionicons
              name="ellipsis-horizontal-circle-outline"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {savedState === "saving" && (
          <Text style={styles.savingHint}>Saving…</Text>
        )}

        {mode === "write" && Platform.OS !== "ios" && (
          <View style={styles.androidToolbarRow}>
            <FormattingToolbar colors={colors} onFormat={applyFormat} />
            <TouchableOpacity
              style={[styles.doneChip, { backgroundColor: colors.primary }]}
              onPress={handleBack}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.doneChipText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
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
              inputAccessoryViewID={
                Platform.OS === "ios" ? FORMAT_TOOLBAR_ID : undefined
              }
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
                <Text style={{ color: colors.textMuted }}>
                  Nothing to preview yet.
                </Text>
              )}
            </View>
          )}

          {backlinks !== undefined && backlinks.length > 0 && (
            <View style={styles.backlinksSection}>
              <Text style={styles.backlinksTitle}>Linked from</Text>
              {backlinks.map((b) => (
                <TouchableOpacity
                  key={b._id}
                  onPress={() => router.push(`/notes/${b._id}`)}
                >
                  <Text style={styles.backlinkItem}>
                    {b.title.trim() || "Untitled"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      {Platform.OS === "ios" && mode === "write" && (
        <InputAccessoryView nativeID={FORMAT_TOOLBAR_ID}>
          <View
            style={[
              styles.iosAccessoryRow,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={{ flex: 1 }}>
              <FormattingToolbar colors={colors} onFormat={applyFormat} />
            </View>
            <TouchableOpacity
              style={[styles.doneChip, { backgroundColor: colors.primary }]}
              onPress={handleBack}
            >
              <Text style={styles.doneChipText}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}

      <Modal
        visible={optionsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setOptionsOpen(false)}
      >
        <TouchableOpacity
          style={sheetStyles.backdrop}
          activeOpacity={1}
          onPress={() => setOptionsOpen(false)}
        >
          <BlurView
            intensity={45}
            tint="dark"
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <TouchableOpacity activeOpacity={1} style={sheetStyles.sheet}>
            <View style={sheetStyles.handle} />
            <Text style={sheetStyles.title}>Note Options</Text>

            <Text style={styles.optionsLabel}>Color</Text>
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
                  {!c && (
                    <Ionicons name="close" size={12} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => {
                  setOptionsOpen(false);
                  setCustomPickerOpen(true);
                }}
                style={[
                  styles.swatch,
                  styles.customSwatch,
                  {
                    borderColor:
                      color && !NOTE_COLORS.includes(color)
                        ? colors.text
                        : colors.border,
                    borderWidth: color && !NOTE_COLORS.includes(color) ? 2 : 1,
                    backgroundColor:
                      color && !NOTE_COLORS.includes(color)
                        ? color
                        : "transparent",
                  },
                ]}
              >
                <Ionicons
                  name="color-palette-outline"
                  size={14}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.deleteRow}
              onPress={() => {
                setOptionsOpen(false);
                handleDelete();
              }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
              <Text style={styles.deleteRowText}>Delete Note</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={customPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomPickerOpen(false)}
      >
        <BlurView intensity={45} tint="dark" style={modalStyles.backdrop}>
          <View style={[modalStyles.card, { alignItems: "center" }]}>
            <View style={modalStyles.header}>
              <View style={modalStyles.headerSide} />
              <Text style={modalStyles.title}>Pick a color</Text>
              <TouchableOpacity
                onPress={() => setCustomPickerOpen(false)}
                style={modalStyles.headerSide}
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
        </BlurView>
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
      marginBottom: 6,
    },
    headerIconButton: {
      padding: 4,
      width: 34,
      alignItems: "center",
    },
    savingHint: {
      fontSize: 11,
      color: colors.textMuted,
      textAlign: "center",
      marginBottom: 8,
    },
    androidToolbarRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    iosAccessoryRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    doneChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
      marginLeft: 4,
    },
    doneChipText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 14,
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
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 20,
    },
    swatch: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    customSwatch: {
      borderStyle: "dashed",
    },
    optionsLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textMuted,
      marginTop: 6,
      marginBottom: 10,
    },
    deleteRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 4,
    },
    deleteRowText: {
      color: colors.danger,
      fontSize: 16,
      fontWeight: "600",
    },
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
    saveButtonText: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "700",
    },
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
