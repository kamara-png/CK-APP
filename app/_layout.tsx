import { ThemeProvider } from "@/hooks/useTheme";
import { configureNotifications } from "@/lib/notifications";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

// Only construct the client if we actually have a URL — the SDK throws
// synchronously at module load otherwise, which freezes the app before
// React ever renders (no error screen, just a stuck splash screen).
const convex = convexUrl ? new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
}) : null;

function MissingEnvScreen() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Convex URL missing</Text>
        <Text style={styles.body}>
          EXPO_PUBLIC_CONVEX_URL isn&apos;t set, so the app can&apos;t connect to your
          backend.{"\n\n"}
          1. Run `npx convex dev` in your project folder.{"\n"}
          2. Confirm it wrote EXPO_PUBLIC_CONVEX_URL into .env.local.{"\n"}
          3. Restart Expo (stop and re-run `npx expo start`) so it picks up
          the env file — env vars are only read at startup.
        </Text>
      </View>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  useEffect(() => {
    configureNotifications();
  }, []);

  if (!convex) {
    return <MissingEnvScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConvexProvider client={convex}>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="notes/index" options={{ presentation: "modal" }} />
            <Stack.Screen name="notes/[id]" options={{ presentation: "modal" }} />
          </Stack>
        </ThemeProvider>
      </ConvexProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#0f172a",
  },
  title: {
    color: "#f87171",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  body: {
    color: "#f1f5f9",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "left",
  },
});