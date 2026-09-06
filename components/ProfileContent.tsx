import DangerZone from "@/components/DangerZone";
import Preferences from "@/components/Preferences";
import ProgressStats from "@/components/ProgressStats";
import useTheme from "@/hooks/useTheme";
import { loadProfile, pickAndSaveProfilePhoto, saveProfileName } from "@/lib/profile";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export default function ProfileContent() {
  const { colors } = useTheme();
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
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.profileRow}>
        <TouchableOpacity onPress={handlePickPhoto} style={styles.avatarWrap}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={28} color={colors.textMuted} />
            </View>
          )}
          <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="camera" size={12} color="#fff" />
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
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    profileRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginBottom: 20,
    },
    avatarWrap: {
      position: "relative",
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
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
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.bg,
    },
    nameInput: {
      flex: 1,
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: 6,
    },
  });
