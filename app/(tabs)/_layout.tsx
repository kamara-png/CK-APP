import { Stack } from "expo-router";

// The bottom-tabs navigator previously used here has been replaced by a
// single-screen PagerView (see index.tsx) that gives real Instagram-style
// continuous-drag swiping between Todos/Streaks/Statistics, with its own
// custom bottom tab bar synced to the drag position. This layout is now just
// a pass-through so expo-router still has a "(tabs)" group to route into.
export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
