import { kv } from '@vercel/kv';

const DEFAULT_MAX_GB = 128;

// Claves en KV
function maxKey(userId: string): string {
  return `user:${userId}:max`;
}
function usedKey(userId: string): string {
  return `user:${userId}:used`;
}

// Obtener el límite máximo del usuario
async function getMax(userId: string): Promise<number> {
  const value = await kv.get<number>(maxKey(userId));
  return value ?? DEFAULT_MAX_GB;
}

// Establecer un nuevo límite máximo (uso administrativo)
async function setMax(userId: string, newMax: number): Promise<void> {
  await kv.set(maxKey(userId), newMax);
}

// Añadir GB al límite máximo (el administrador sube la cuota)
export async function addMax(userId: string, addGB: number): Promise<void> {
  const current = await getMax(userId);
  await setMax(userId, current + addGB);
}

// Obtener el espacio ya consumido por el usuario
async function getUsed(userId: string): Promise<number> {
  const value = await kv.get<number>(usedKey(userId));
  return value ?? 0;
}

// Consumir almacenamiento (al guardar configuración)
export async function consumeStorage(userId: string, usageGB: number): Promise<{ success: boolean; error?: string }> {
  const max = await getMax(userId);
  const used = await getUsed(userId);
  if (used + usageGB > max) {
    return { success: false, error: 'Has agotado tu almacenamiento. Pide al administrador que te amplíe el límite.' };
  }
  await kv.set(usedKey(userId), used + usageGB);
  return { success: true };
}

// Obtener info completa (usado, máximo, libre)
export async function getUserStorageInfo(userId: string) {
  const [max, used] = await Promise.all([getMax(userId), getUsed(userId)]);
  return { used, max, free: max - used };
}
