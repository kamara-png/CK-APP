import { createSettingsStyles } from "@/assets/styles/settings.styles";
import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

const AccountSection = () => {
  const { colors } = useTheme();
  const settingsStyles = createSettingsStyles(colors);
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.current);

  const handleSignOut = () => {
    Alert.alert("Sign out?", "You can sign back in anytime with your email and password.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <View style={[settingsStyles.section, { backgroundColor: colors.surface }]}>
      <Text style={settingsStyles.sectionTitle}>Account</Text>

      {user?.email && (
        <View style={settingsStyles.actionLeft}>
          <View style={[settingsStyles.actionIcon, { backgroundColor: colors.primary + "20" }]}>
            <Ionicons name="mail" size={18} color={colors.primary} />
          </View>
          <Text style={settingsStyles.actionText}>{user.email}</Text>
        </View>
      )}

      <TouchableOpacity style={settingsStyles.actionButton} onPress={handleSignOut}>
        <View style={settingsStyles.actionLeft}>
          <View style={[settingsStyles.actionIcon, { backgroundColor: colors.danger + "20" }]}>
            <Ionicons name="log-out" size={18} color={colors.danger} />
          </View>
          <Text style={settingsStyles.actionTextDanger}>Sign Out</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

export default AccountSection;
