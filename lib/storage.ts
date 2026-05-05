import { kv } from '@vercel/kv';

const MAX_GB = 128;

function storageKey(guildId: string): string {
  return `guild:${guildId}:storage`;
}

export async function getStorage(guildId: string): Promise<number> {
  const value = await kv.get<number>(storageKey(guildId));
  return value || 0;
}

export async function addStorage(guildId: string, addGB: number): Promise<{ success: boolean; error?: string }> {
  const current = await getStorage(guildId);
  if (current + addGB > MAX_GB) {
    return { success: false, error: 'Almacenamiento insuficiente. No puedes gastar más GB.' };
  }
  await kv.set(storageKey(guildId), current + addGB);
  return { success: true };
}

export async function getStorageInfo(guildId: string) {
  const used = await getStorage(guildId);
  return { used, max: MAX_GB, free: MAX_GB - used };
}
