import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function timeAgo(ms: number) {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function NotesListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const notes = useQuery(api.notes.getNotes);
  const createNote = useMutation(api.notes.createNote);
  const [search, setSearch] = useState("");
  const styles = createStyles(colors);

  const filtered = useMemo(() => {
    if (!notes) return [];
    const q = search.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [notes, search]);

  const handleCreate = async () => {
    const id = await createNote({ title: "", content: "" });
    router.push(`/notes/${id}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notes</Text>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search them notes..."
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {notes === undefined ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {notes.length === 0 ? "No notes yet, tap + to do something for once" : "Hakuna matches."}
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.noteCard,
                item.color ? { borderLeftWidth: 4, borderLeftColor: item.color } : null,
              ]}
              onPress={() => router.push(`/notes/${item._id}`)}
            >
              <Text style={styles.noteTitle} numberOfLines={1}>
                {item.title.trim() || "Untitled"}
              </Text>
              <Text style={styles.noteSnippet} numberOfLines={2}>
                {item.content.trim() || "No creativity yet"}
              </Text>
              <Text style={styles.noteMeta}>{timeAgo(item.updatedAt)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <View>
      <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => handleCreate()} >
                <Ionicons name="add" size={30} color="#fff" />
              </TouchableOpacity>
    </View>
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
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    title: {
      fontSize: 30,
      fontWeight: "900",
      color: colors.text,
      right: 270,
      position: "absolute",
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
      paddingVertical: 10,
      color: colors.text,
    },
    empty: {
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 40,
    },
    noteCard: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 10,
    },
    noteTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 4,
    },
    noteSnippet: {
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
    },
    noteMeta: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 8,
    },
     fab: {
      position: "absolute",
      right: 10,
      bottom: 100,
      width: 58,
      height: 58,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
    },
  });
