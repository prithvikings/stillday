import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { getCompletions, getHabits } from "./storage";

const BACKUP_VERSION = 1;

export async function exportBackup(): Promise<void> {
  const canShare = await Sharing.isAvailableAsync();

  if (!canShare) {
    throw new Error("Sharing is not available on this device.");
  }

  // Read both datasets before creating a backup so a read failure never
  // produces a file that looks like a successful, complete export.
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

  const dateStamp = new Date().toISOString().slice(0, 10);
  const fileName = `stillday-backup-${dateStamp}.json`;

  const directory = new Directory(Paths.cache);
  const file = new File(directory, fileName);

  // These Expo FileSystem operations are synchronous in the current API.
  file.create({ overwrite: true });
  file.write(JSON.stringify(backup, null, 2));

  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    dialogTitle: "Export Stillday backup",
    UTI: "public.json",
  });
}
