import SignInScreen from "@/components/auth/SignInScreen";
import { ThemeProvider } from "@/hooks/useTheme";
import { secureTokenStorage } from "@/lib/authStorage";
import { configureNotifications } from "@/lib/notifications";
import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from "@expo-google-fonts/inter";
import { ConvexAuthProvider, useConvexAuth } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { ReactNode, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

// Only construct the client if we actually have a URL — the SDK throws
// synchronously at module load otherwise, which freezes the app before
// React ever renders (no error screen, just a stuck splash screen).
const convex = convexUrl ? new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
}) : null;


function applyGlobalFont() {
  // @ts-expect-error — defaultProps exists at runtime even though newer RN types omit it
  Text.defaultProps = Text.defaultProps || {};
  // @ts-expect-error
  Text.defaultProps.style = [{ fontFamily: "Inter_400Regular" }, Text.defaultProps.style];
  // @ts-expect-error
  TextInput.defaultProps = TextInput.defaultProps || {};
  // @ts-expect-error
  TextInput.defaultProps.style = [{ fontFamily: "Inter_400Regular" }, TextInput.defaultProps.style];
}

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

/**
 * Gates the app's real content behind sign-in. Convex Auth reports
 * `isLoading` while it restores a session from secure storage on launch, so
 * we show a blank/spinner state rather than flashing the sign-in screen for
 * users who are actually already logged in.
 */
function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: "#0f172a" }]}>
        <ActivityIndicator color="#60a5fa" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <SignInScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    configureNotifications();
  }, []);

  useEffect(() => {
    if (fontsLoaded) applyGlobalFont();
  }, [fontsLoaded]);

  if (!convex) {
    return <MissingEnvScreen />;
  }

  if (!fontsLoaded) {
    return <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0f172a" }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConvexAuthProvider client={convex} storage={secureTokenStorage}>
        <ThemeProvider>
          <AuthGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="notes/index"
                options={{ animation: "slide_from_right", gestureEnabled: true, gestureDirection: "horizontal" }}
              />
              <Stack.Screen
                name="notes/[id]"
                options={{ animation: "slide_from_right", gestureEnabled: true, gestureDirection: "horizontal" }}
              />
            </Stack>
          </AuthGate>
        </ThemeProvider>
      </ConvexAuthProvider>
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
    textAlign: "center",
  },
  body: {
    color: "#f1f5f9",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "left",
  },
  
});