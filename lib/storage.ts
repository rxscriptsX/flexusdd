import { Redis } from '@upstash/redis';

// Conexión segura usando variables de entorno
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const MAX_GB = 128;

function storageKey(guildId: string): string {
  return `guild:${guildId}:storage`;
}

export async function getStorage(guildId: string): Promise<number> {
  const value = await redis.get<number>(storageKey(guildId));
  return value || 0;
}

export async function addStorage(guildId: string, addGB: number): Promise<{ success: boolean; error?: string }> {
  const current = await getStorage(guildId);
  if (current + addGB > MAX_GB) {
    return { success: false, error: 'Almacenamiento insuficiente. No puedes gastar más GB.' };
  }
  await redis.set(storageKey(guildId), current + addGB);
  return { success: true };
}

export async function getStorageInfo(guildId: string) {
  const used = await getStorage(guildId);
  return { used, max: MAX_GB, free: MAX_GB - used };
}
