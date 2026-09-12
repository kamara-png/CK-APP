import DateTimeField from "@/components/DateTimeField";
import { createModalStyles } from "@/assets/styles/common";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ColorScheme } from "@/hooks/useTheme";
import { ReminderSound } from "@/lib/notifications";
import { uploadImageToConvex } from "@/lib/uploadImage";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SOUND_OPTIONS: { value: ReminderSound; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "default", label: "Default", icon: "notifications" },
  { value: "alarm", label: "Alarm", icon: "alarm" },
  { value: "chime", label: "Chime", icon: "musical-notes" },
  { value: "silent", label: "Silent", icon: "notifications-off" },
];

interface TodoEditorProps {
  visible: boolean;
  todoId: Id<"todos"> | null;
  initialText: string;
  initialReminderAt?: number;
  initialReminderSound?: ReminderSound;
  initialImageUrl?: string | null;
  colors: ColorScheme;
  onSave: (text: string, reminderAt?: number, reminderSound?: ReminderSound) => void;
  onClose: () => void;
}

export default function TodoEditor({
  visible,
  todoId,
  initialText,
  initialReminderAt,
  initialReminderSound,
  initialImageUrl,
  colors,
  onSave,
  onClose,
}: TodoEditorProps) {
  const [text, setText] = useState(initialText);
  const [reminderOn, setReminderOn] = useState(Boolean(initialReminderAt));
  const [date, setDate] = useState(
    initialReminderAt ? new Date(initialReminderAt) : new Date(Date.now() + 60 * 60 * 1000)
  );
  const [sound, setSound] = useState<ReminderSound>(initialReminderSound ?? "default");
  const [imageUrl, setImageUrl] = useState<string | null | undefined>(initialImageUrl);
  const [uploadingImage, setUploadingImage] = useState(false);
  const modalStyles = createModalStyles(colors);
  const styles = createStyles(colors);
  const generateUploadUrl = useMutation(api.todos.generateUploadUrl);
  const setTodoImage = useMutation(api.todos.setTodoImage);

  useEffect(() => {
    if (visible) {
      setText(initialText);
      setReminderOn(Boolean(initialReminderAt));
      setDate(initialReminderAt ? new Date(initialReminderAt) : new Date(Date.now() + 60 * 60 * 1000));
      setSound(initialReminderSound ?? "default");
      setImageUrl(initialImageUrl);
    }
  }, [visible, initialText, initialReminderAt, initialReminderSound, initialImageUrl]);

  const handlePickImage = async () => {
    if (!todoId) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const uri = result.assets[0].uri;
    setUploadingImage(true);
    try {
      const storageId = await uploadImageToConvex(uri, () => generateUploadUrl({}));
      await setTodoImage({ id: todoId, imageId: storageId as Id<"_storage"> });
      setImageUrl(uri);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!todoId) return;
    await setTodoImage({ id: todoId, imageId: null });
    setImageUrl(null);
  };

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSave(trimmed, reminderOn ? date.getTime() : undefined, reminderOn ? sound : undefined);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={45} tint="dark" style={modalStyles.backdrop}>
        <View style={modalStyles.card}>
          <View style={modalStyles.header}>
            <View style={modalStyles.headerSide} />
            <Text style={modalStyles.title}>Edit todo</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.headerSide}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Todo text"
            placeholderTextColor={colors.textMuted}
            autoFocus
            multiline
          />

          {imageUrl ? (
            <View style={styles.imagePreviewWrap}>
              <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
              {uploadingImage && (
                <View style={styles.imageUploadingOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
              <TouchableOpacity style={styles.imageRemoveButton} onPress={handleRemoveImage}>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addImageButton} onPress={handlePickImage}>
              <Ionicons name="image-outline" size={18} color={colors.primary} />
              <Text style={[styles.addImageText, { color: colors.primary }]}>
                {uploadingImage ? "Uploading…" : "Add a photo"}
              </Text>
            </TouchableOpacity>
          )}


          <TouchableOpacity
            style={styles.reminderToggle}
            onPress={() => setReminderOn((v) => !v)}
          >
            <Ionicons
              name={reminderOn ? "alarm" : "alarm"}
              size={18}
              color={reminderOn ? colors.primary : colors.textMuted}
            />
            <Text style={{ color: reminderOn ? colors.primary : colors.textMuted, fontWeight: "600" }}>
              {reminderOn ? "Reminder on" : "Add a reminder"}
            </Text>
          </TouchableOpacity>

          {reminderOn && (
            <>
              <Text style={styles.label}>When</Text>
              <DateTimeField
                value={date}
                onChange={setDate}
                color={colors.text}
                mutedColor={colors.textMuted}
                borderColor={colors.border}
              />
              <Text style={styles.label}>Sound</Text>
              <Text style={styles.helper}>Choose a sound for this reminder.</Text>
              <View style={styles.soundRow}>
                {SOUND_OPTIONS.map((option) => {
                  const active = option.value === sound;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.soundOption,
                        {
                          borderColor: active ? colors.primary : colors.border,
                          backgroundColor: active ? colors.primary + "15" : "transparent",
                        },
                      ]}
                      onPress={() => setSound(option.value)}
                    >
                      <Ionicons
                        name={option.icon}
                        size={16}
                        color={active ? colors.primary : colors.textMuted}
                      />
                      <Text style={{ color: active ? colors.primary : colors.text, fontWeight: "600" }}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save changes</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
}

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: colors.text,
      backgroundColor: colors.backgrounds.editInput,
      minHeight: 60,
      textAlignVertical: "top",
    },
    reminderToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 16,
    },
    addImageButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 12,
      paddingVertical: 8,
    },
    addImageText: {
      fontWeight: "600",
      fontSize: 14,
    },
    imagePreviewWrap: {
      marginTop: 12,
      borderRadius: 12,
      overflow: "hidden",
      alignSelf: "flex-start",
    },
    imagePreview: {
      width: 96,
      height: 96,
      borderRadius: 12,
    },
    imageUploadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.4)",
      alignItems: "center",
      justifyContent: "center",
    },
    imageRemoveButton: {
      position: "absolute",
      top: 4,
      right: 4,
      backgroundColor: "rgba(0,0,0,0.55)",
      borderRadius: 10,
      width: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textMuted,
      marginBottom: 8,
      marginTop: 12,
    },
    soundRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    soundOption: {
      flexDirection: "row",
      alignItems: "center",
      flexBasis: "48%",
      flexGrow: 1,
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1.5,
    },
    helper: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: -4,
      marginBottom: 10,
    },
    saveButton: {
      marginTop: 20,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
    },
    saveButtonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 15,
    },
  });
