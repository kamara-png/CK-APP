import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

const NAME_KEY = "profileName";
const PHOTO_KEY = "profilePhotoUri";

export async function loadProfile(): Promise<{ name: string; photoUri: string | null }> {
  const [name, photoUri] = await Promise.all([
    AsyncStorage.getItem(NAME_KEY),
    AsyncStorage.getItem(PHOTO_KEY),
  ]);
  return { name: name ?? "", photoUri };
}

export async function saveProfileName(name: string) {
  await AsyncStorage.setItem(NAME_KEY, name);
}

/**
 * Opens the device photo library, and if a photo is picked, copies it into
 * this app's own document directory so it persists reliably across app
 * restarts.
 * Returns the new persistent URI, or null if the user cancelled or denied
 * permission.
 */
export async function pickAndSaveProfilePhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const picked = new File(result.assets[0].uri);
  const dest = new File(Paths.document, "profile-photo.jpg");
  if (dest.exists) dest.delete();
  picked.copy(dest);

  await AsyncStorage.setItem(PHOTO_KEY, dest.uri);
  return dest.uri;
}
