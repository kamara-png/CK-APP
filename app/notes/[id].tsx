import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import FormattingToolbar, { FormatAction } from "@/components/FormattingToolbar";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useConvex, useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
  const loadedRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    saveTimer.current = setTimeout(async () => {
      await updateNote({ id: noteId, title, content, color });
      setSavedState("saved");
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, color]);

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
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.savedLabel}>{savedState === "saving" ? "Saving…" : "Saved"}</Text>
          <TouchableOpacity onPress={handleDelete} style={{ padding: 4 }}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
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
      marginBottom: 8,
    },
    savedLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    toolRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    modeSwitch: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: 8,
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
      gap: 6,
    },
    swatch: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
    },
    titleInput: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      paddingVertical: 12,
    },
    contentInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      paddingBottom: 40,
      minHeight: 300,
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
