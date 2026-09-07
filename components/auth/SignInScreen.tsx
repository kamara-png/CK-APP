import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useAuthActions } from "@convex-dev/auth/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Flow = "signIn" | "signUp";

function friendlyError(err: unknown): string {
  if (err instanceof ConvexError) {
    const data = err.data;
    if (typeof data === "string" && data.length < 200) return data;
  }
  const message = err instanceof Error ? err.message : String(err);
  if (message.toLowerCase().includes("invalidsecret") || message.toLowerCase().includes("invalid password")) {
    return "That email and password don't match.";
  }
  if (message.toLowerCase().includes("already") || message.toLowerCase().includes("exists")) {
    return "An account with that email already exists — try signing in instead.";
  }
  return "Something went wrong. Please try again.";
}

export default function SignInScreen() {
  const { colors } = useTheme();
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<Flow>("signIn");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = createStyles(colors);

  const canSubmit =
    email.trim().length > 3 &&
    password.length >= 8 &&
    (flow === "signIn" || name.trim().length > 0) &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await signIn("password", {
        email: email.trim().toLowerCase(),
        password,
        flow,
        ...(flow === "signUp" ? { name: name.trim() } : {}),
      });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
          <Ionicons name="flash" size={30} color="#fff" />
        </View>
        <Text style={styles.title}>CK-APP</Text>
        <Text style={styles.subtitle}>
          {flow === "signIn" ? "Welcome back." : "Create your account to get started."}
        </Text>
      </View>

      <View style={styles.form}>
        {flow === "signUp" && (
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password (min 8 characters)"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPassword}
            autoComplete="password"
          />
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: canSubmit ? colors.primary : colors.border },
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>
              {flow === "signIn" ? "Sign in" : "Create account"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchFlow}
          onPress={() => {
            setError(null);
            setFlow(flow === "signIn" ? "signUp" : "signIn");
          }}
        >
          <Text style={styles.switchFlowText}>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
            <Text style={{ color: colors.primary, fontWeight: "700" }}>
              {flow === "signIn" ? "Sign up" : "Sign in"}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 28,
    },
    header: {
      alignItems: "center",
      marginBottom: 36,
    },
    logoBadge: {
      width: 64,
      height: 64,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "900",
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 6,
      textAlign: "center",
    },
    form: {
      gap: 12,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.backgrounds.input,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
    },
    input: {
      flex: 1,
      paddingVertical: 14,
      color: colors.text,
      fontSize: 15,
    },
    error: {
      color: colors.danger,
      fontSize: 13,
      textAlign: "center",
    },
    submitButton: {
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    submitText: {
      color: "#fff",
      fontWeight: "800",
      fontSize: 16,
    },
    switchFlow: {
      alignItems: "center",
      marginTop: 8,
    },
    switchFlowText: {
      color: colors.textMuted,
      fontSize: 13,
    },
  });
