import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

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
  const file = new File(Paths.cache, `ck-app-backup-${dateStamp}.json`);
  if (file.exists) file.delete();
  file.write(json);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      dialogTitle: "Save your CK-APP backup",
    });
  }

  return file.uri;
}
