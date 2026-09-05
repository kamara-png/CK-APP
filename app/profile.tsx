import DangerZone from "@/components/DangerZone";
import Preferences from "@/components/Preferences";
import ProgressStats from "@/components/ProgressStats";
import useTheme from "@/hooks/useTheme";
import { loadProfile, pickAndSaveProfilePhoto, saveProfileName } from "@/lib/profile";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [name, setName] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const styles = createStyles(colors);

  useEffect(() => {
    loadProfile().then((p) => {
      setName(p.name);
      setPhotoUri(p.photoUri);
    });
  }, []);

  const handlePickPhoto = async () => {
    const uri = await pickAndSaveProfilePhoto();
    if (uri) setPhotoUri(uri);
  };

  const handleNameBlur = () => {
    saveProfileName(name.trim());
  };

  return (
    <Pressable style={styles.backdrop} onPress={() => router.back()}>
      <Pressable style={styles.sheet} onPress={() => {}}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-down" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.profileRow}>
            <TouchableOpacity onPress={handlePickPhoto} style={styles.avatarWrap}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={32} color={colors.textMuted} />
                </View>
              )}
              <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={13} color="#fff" />
              </View>
            </TouchableOpacity>

            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              onBlur={handleNameBlur}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <ProgressStats />
          <Preferences />
          <DangerZone />
        </ScrollView>
      </Pressable>
    </Pressable>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    sheet: {
      height: "88%",
      backgroundColor: colors.bg,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    handle: {
      alignSelf: "center",
      width: 40,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.border,
      marginBottom: 12,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },
    profileRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginBottom: 24,
    },
    avatarWrap: {
      position: "relative",
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
    },
    avatarPlaceholder: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    cameraBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.bg,
    },
    nameInput: {
      flex: 1,
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: 6,
    },
  });
