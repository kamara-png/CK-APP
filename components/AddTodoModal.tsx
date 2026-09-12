import DateTimeField from "@/components/DateTimeField";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { createModalStyles } from "@/assets/styles/common";
import { ColorScheme } from "@/hooks/useTheme";
import { ReminderSound } from "@/lib/notifications";
import { uploadImageToConvex } from "@/lib/uploadImage";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddTodoModalProps {
  visible: boolean;
  colors: ColorScheme;
  onSubmit: (
    text: string,
    reminderAt?: number,
    reminderSound?: ReminderSound,
    imageId?: Id<"_storage">,
  ) => void;
  onClose: () => void;
}

export default function AddTodoModal({
  visible,
  colors,
  onSubmit,
  onClose,
}: AddTodoModalProps) {
  const [text, setText] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState(
    () => new Date(Date.now() + 60 * 60 * 1000),
  );
  const [imagePreviewUri, setImagePreviewUri] = useState<string | null>(null);
  const [imageId, setImageId] = useState<Id<"_storage"> | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const generateUploadUrl = useMutation(api.todos.generateUploadUrl);
  const modalStyles = createModalStyles(colors);
  const styles = createStyles(colors);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const uri = result.assets[0].uri;
    setImagePreviewUri(uri);
    setUploadingImage(true);
    try {
      const id = await uploadImageToConvex(uri, () => generateUploadUrl({}));
      setImageId(id as Id<"_storage">);
    } catch {
      setImagePreviewUri(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreviewUri(null);
    setImageId(null);
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    onSubmit(
      trimmed,
      reminderEnabled ? reminderDate.getTime() : undefined,
      reminderEnabled ? "alarm" : undefined,
      imageId ?? undefined,
    );
    setReminderEnabled(false);
    setReminderDate(new Date(Date.now() + 60 * 60 * 1000));
    setImagePreviewUri(null);
    setImageId(null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={45} tint="dark" style={modalStyles.backdrop}>
        <View style={modalStyles.card}>
          <View style={modalStyles.header}>
            <View style={modalStyles.headerSide} />
            <Text style={modalStyles.title}>New todo</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.headerSide}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Leo tufanye?"
            placeholderTextColor={colors.textMuted}
            autoFocus
            multiline
            onSubmitEditing={handleSubmit}
          />

          {imagePreviewUri ? (
            <View style={styles.imagePreviewWrap}>
              <Image
                source={{ uri: imagePreviewUri }}
                style={styles.imagePreview}
              />
              {uploadingImage && (
                <View style={styles.imageUploadingOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
              <TouchableOpacity
                style={styles.imageRemoveButton}
                onPress={handleRemoveImage}
              >
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={handlePickImage}
            >
              <Ionicons name="image" size={18} color={colors.primary} />
              <Text style={[styles.addImageText, { color: colors.primary }]}>
                Add a photo to remind you
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.reminderRow}>
            <View style={styles.reminderLabelRow}>
              <Ionicons
                name={reminderEnabled ? "alarm" : "alarm-outline"}
                size={20}
                color={reminderEnabled ? colors.primary : colors.textMuted}
              />
              <View>
                <Text style={styles.reminderTitle}>Set an alarm</Text>
                <Text style={styles.reminderHint}>
                  Get notified when it is time to do this task
                </Text>
              </View>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          {reminderEnabled && (
            <DateTimeField
              value={reminderDate}
              onChange={setReminderDate}
              color={colors.text}
              mutedColor={colors.textMuted}
              borderColor={colors.border}
            />
          )}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Add todo bossi</Text>
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
      textAlignVertical: "center",
    },
    reminderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 16,
      marginBottom: 12,
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
      width: 90,
      height: 90,
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
    reminderLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    reminderTitle: {
      color: colors.text,
      fontWeight: "700",
      fontSize: 14,
    },
    reminderHint: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    button: {
      marginTop: 20,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 15,
    },
  });
