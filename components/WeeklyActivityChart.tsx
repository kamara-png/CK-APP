import { StyleSheet, Text, View } from "react-native";

interface Todo {
  _creationTime: number;
}

interface WeeklyActivityChartProps {
  todos: Todo[];
  color: string;
  trackColor: string;
  textColor: string;
  mutedColor: string;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function bucketLast7Days(todos: Todo[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const buckets = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfToday);
    day.setDate(day.getDate() - (6 - i));
    return { day, count: 0 };
  });

  for (const todo of todos) {
    const created = new Date(todo._creationTime);
    const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());
    const bucket = buckets.find((b) => b.day.getTime() === createdDay.getTime());
    if (bucket) bucket.count += 1;
  }

  return buckets;
}

const WeeklyActivityChart = ({
  todos,
  color,
  trackColor,
  textColor,
  mutedColor,
}: WeeklyActivityChartProps) => {
  const buckets = bucketLast7Days(todos);
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const styles = createStyles();

  return (
    <View style={styles.container}>
      {buckets.map((bucket, i) => {
        const heightPct = bucket.count === 0 ? 0 : Math.max(12, (bucket.count / max) * 100);
        return (
          <View key={i} style={styles.column}>
            <Text style={[styles.count, { color: bucket.count ? textColor : mutedColor }]}>
              {bucket.count > 0 ? bucket.count : ""}
            </Text>
            <View style={[styles.track, { backgroundColor: trackColor }]}>
              <View
                style={[
                  styles.fill,
                  {
                    height: `${heightPct}%`,
                    backgroundColor: bucket.count ? color : "transparent",
                  },
                ]}
              />
            </View>
            <Text style={[styles.label, { color: mutedColor }]}>
              {DAY_LABELS[bucket.day.getDay()]}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const createStyles = () =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      height: 110,
      paddingTop: 4,
    },
    column: {
      flex: 1,
      alignItems: "center",
      height: "100%",
      justifyContent: "flex-end",
    },
    count: {
      fontSize: 11,
      fontWeight: "600",
      marginBottom: 4,
      height: 14,
    },
    track: {
      width: 14,
      height: 60,
      borderRadius: 7,
      justifyContent: "flex-end",
      overflow: "hidden",
    },
    fill: {
      width: "100%",
      borderRadius: 7,
    },
    label: {
      fontSize: 11,
      marginTop: 6,
      fontWeight: "500",
    },
  });

export default WeeklyActivityChart;
