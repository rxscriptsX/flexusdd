import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { consumeStorage } from '../../lib/storage';
import { getToken } from 'next-auth/jwt';

const COOLDOWN_SECONDS = 32 * 3600;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.sub) return res.status(401).json({ error: 'No autorizado' });

  const userId = token.sub;
  const { name, guildId } = req.body;
  if (!name || typeof name !== 'string' || name.length > 10 || !guildId || typeof guildId !== 'string') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  // Verificar cooldown de 32 horas
  const cooldownKey = `create-server-cooldown:${userId}`;
  const existing = await kv.get(cooldownKey);
  if (existing) return res.status(429).json({ error: 'Debes esperar 32 horas para crear otro servidor.' });

  // Verificar si el nombre ya existe globalmente
  const globalKey = `server:${name}:owner`;
  const owner = await kv.get(globalKey);
  if (owner) return res.status(409).json({ error: 'El nombre del servidor ya está en uso.' });

  // Consumir 49 GB
  const storage = await consumeStorage(userId, 49);
  if (!storage.success) return res.status(403).json({ error: storage.error || 'Sin espacio suficiente.' });

  // Generar contraseña de 72 dígitos
  const password = Array.from({ length: 72 }, () => Math.floor(Math.random() * 10)).join('');

  // Guardar servidor en KV
  await kv.set(globalKey, userId);
  await kv.set(`server:${name}:data`, {
    owner: userId,
    guildId,
    password,
    users: [userId],
  });

  // Establecer cooldown de 32 horas
  await kv.set(cooldownKey, '1', { ex: COOLDOWN_SECONDS });

  return res.status(200).json({ success: true, password });
}
