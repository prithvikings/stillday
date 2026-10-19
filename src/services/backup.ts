import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { getCompletions, getHabits } from "./storage";

const BACKUP_VERSION = 1;

export async function exportBackup(): Promise<void> {
  const canShare = await Sharing.isAvailableAsync();

  if (!canShare) {
    throw new Error("Sharing is not available on this device.");
  }

  const [habits, completions] = await Promise.all([
    getHabits(),
    getCompletions(),
  ]);

  const backup = {
    app: "Stillday",
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      habits,
      completions,
    },
  };

  const fileName = `stillday-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  const directory = new Directory(Paths.cache);
  const file = new File(directory, fileName);

  file.create({ overwrite: true });
  file.write(JSON.stringify(backup, null, 2));

  const fileUri = file.uri;

  await Sharing.shareAsync(fileUri, {
    mimeType: "application/json",
    dialogTitle: "Export Stillday backup",
    UTI: "public.json",
  });
}
