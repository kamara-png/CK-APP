import BouncyIcon from "@/components/BouncyIcon";
import HabitEditor from "@/components/HabitEditor";
import SwipeableRow from "@/components/SwipeableRow";
import SwipeTabScreen from "@/components/SwipeTabScreen";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import useTheme from "@/hooks/useTheme";
import { computeStreakStats, getLast7Days, getLocalDateKey } from "@/lib/streaks";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DAY_LABELS = ["S", "M", "T", "W", "Th", "F", "Sat"];

export default function StreaksScreen() {
  const { colors } = useTheme();
  const overview = useQuery(api.habits.getHabitsOverview);
  const createHabit = useMutation(api.habits.createHabit);
  const deleteHabit = useMutation(api.habits.deleteHabit);
  const toggleCheckin = useMutation(api.habits.toggleCheckin);
  const [editorOpen, setEditorOpen] = useState(false);

  const styles = createStyles(colors);
  const todayKey = getLocalDateKey();

  const handleCreate = async (name: string, color: string) => {
    await createHabit({ name, color });
    setEditorOpen(false);
  };

  const handleDelete = (id: Id<"habits">, name: string) => {
    Alert.alert(`Delete "${name}"?`, "This removes all your progress man.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteHabit({ id }) },
    ]);
  };

  return (
    <SwipeTabScreen path="/streaks">
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Streaks</Text>
      </View>

      {overview === undefined ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
      ) : (
        <FlatList
          data={overview}
          keyExtractor={({ habit }) => habit._id}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No streaks yet — tap + to start tracking something daily.
            </Text>
          }
          renderItem={({ item }) => {
            const stats = computeStreakStats(item.dateKeys);
            const week = getLast7Days(item.dateKeys);
            const checkedInToday = stats.checkedInToday;

            return (
              <SwipeableRow
                style={{ marginBottom: 10 }}
                completeColor={item.habit.color}
                deleteColor={colors.danger}
                onSwipeComplete={() =>
                  toggleCheckin({ habitId: item.habit._id, dateKey: todayKey })
                }
                onSwipeDelete={() => handleDelete(item.habit._id, item.habit.name)}
              >
                <View style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={[styles.badge, { backgroundColor: item.habit.color + "20" }]}>
                      <Ionicons name="flame" size={18} color={item.habit.color} />
                      <Text style={[styles.badgeNumber, { color: item.habit.color }]}>
                        {stats.current}
                      </Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.name}>{item.habit.name}</Text>
                      <Text style={styles.caption}>
                        {stats.current} day{stats.current === 1 ? "" : "s"} · best {stats.longest}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        toggleCheckin({ habitId: item.habit._id, dateKey: todayKey })
                      }
                      style={[
                        styles.checkInButton,
                        {
                          backgroundColor: checkedInToday ? item.habit.color : "transparent",
                          borderColor: checkedInToday ? item.habit.color : colors.border,
                        },
                      ]}
                    >
                      
                      <BouncyIcon active={checkedInToday}>
                        <Ionicons
                          name={checkedInToday ? "flame" : "flame-outline"}
                          size={22}
                          color={checkedInToday ? "#fff" : colors.textMuted}
                        />
                      </BouncyIcon>
                    </TouchableOpacity>
                    
                  </View>

                  <View style={styles.weekRow}>
                    {week.map((day) => (
                      <View key={day.key} style={styles.weekDay}>
                        <View
                          style={[
                            styles.dot,
                            {
                              backgroundColor: day.checkedIn ? item.habit.color : "transparent",
                              borderColor: day.checkedIn ? item.habit.color : colors.border,
                            },
                          ]}
                        />
                        <Text style={styles.weekLabel}>{DAY_LABELS[day.weekday]}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </SwipeableRow>
            );
          }}
        />
      )}

      <HabitEditor
        visible={editorOpen}
        colors={colors}
        onSave={handleCreate}
        onClose={() => setEditorOpen(false)}
      />
    </View>
    <View>
      <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => setEditorOpen(true)} >
                <Ionicons name="add" size={30} color="#fff" />
              </TouchableOpacity>
    </View>
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
      fontSize: 30,
      fontWeight: "900",
      color: colors.text,
    },
     fab: {
      position: "absolute",
      right: 20,
      bottom: 30,
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
    empty: {
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 40,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
    },
    cardTop: {
      flexDirection: "row",
      alignItems: "center",
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
    },
    badgeNumber: {
      fontWeight: "700",
      fontSize: 15,
    },
    name: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
    },
    caption: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    checkInButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    weekRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    weekDay: {
      alignItems: "center",
      gap: 4,
    },
    dot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
    },
    weekLabel: {
      fontSize: 10,
      color: colors.textMuted,
    },
  });
