import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { addMax } from '../../lib/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, userId } = req.body;
  if (!token || typeof token !== 'string' || !userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  const tokenData = await kv.get<{ gb: number; used: boolean }>(`token:${token}`);
  if (!tokenData || tokenData.used) {
    return res.status(400).json({ error: 'Token inválido o ya usado' });
  }

  // Marcar token como usado para evitar reutilización
  await kv.set(`token:${token}`, { ...tokenData, used: true });

  // Añadir GB al usuario
  await addMax(userId, tokenData.gb);

  return res.status(200).json({ message: `Se han añadido ${tokenData.gb} GB correctamente.` });
}
