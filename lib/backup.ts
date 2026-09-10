import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

interface BackupData {
  exportedAt: string;
  todos: unknown;
  notes: unknown;
  habits: unknown;
}

export async function exportAllData(todos: unknown, notes: unknown, habits: unknown) {
  const backup: BackupData = {
    exportedAt: new Date().toISOString(),
    todos,
    notes,
    habits,
  };

  const json = JSON.stringify(backup, null, 2);
  const dateStamp = new Date().toISOString().slice(0, 10);
  const file = new File(Paths.cache, `tendo-backup-${dateStamp}.json`);
  if (file.exists) file.delete();
  file.write(json);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      dialogTitle: "Save your Tendo backup",
    });
  }

  return file.uri;
}

export type ParsedBackup = {
  todos: { text: string; iscompleted: boolean; completedAt?: number; reminderAt?: number; reminderSound?: "default" | "alarm" | "chime" | "silent" }[];
  notes: { title: string; content: string; updatedAt?: number; color?: string }[];
  habits: { habit: { name: string; color: string; createdAt?: number }; dateKeys: string[] }[];
};

/**
 * Lets the person pick a previously-exported .json backup file and returns
 * its parsed, loosely-validated contents — or null if they cancelled the
 * picker or the file wasn't a recognizable backup.
 */
export async function pickBackupFile(): Promise<ParsedBackup | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.[0]) return null;

  const file = new File(result.assets[0].uri);
  const raw = await file.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("todos" in parsed) ||
    !("notes" in parsed) ||
    !("habits" in parsed)
  ) {
    throw new Error("That doesn't look like a Tendo backup file.");
  }

  const data = parsed as Record<string, unknown>;
  return {
    todos: Array.isArray(data.todos) ? data.todos : [],
    notes: Array.isArray(data.notes) ? data.notes : [],
    habits: Array.isArray(data.habits) ? data.habits : [],
  } as ParsedBackup;
}
