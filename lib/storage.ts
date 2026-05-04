// lib/storage.ts
const storageUsed: Record<string, number> = {};
const MAX_GB = 128;

export function getStorage(guildId: string): number {
  return storageUsed[guildId] || 0;
}

export function addStorage(guildId: string, addGB: number): { success: boolean; error?: string } {
  const current = storageUsed[guildId] || 0;
  if (current + addGB > MAX_GB) {
    return { success: false, error: 'Almacenamiento insuficiente. No puedes gastar más GB.' };
  }
  storageUsed[guildId] = current + addGB;
  return { success: true };
}

export function getStorageInfo(guildId: string) {
  const used = getStorage(guildId);
  return { used, max: MAX_GB, free: MAX_GB - used };
}
