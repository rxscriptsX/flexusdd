import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { gb } = req.body;
  if (!gb || typeof gb !== 'number' || gb <= 0) {
    return res.status(400).json({ error: 'Cantidad inválida' });
  }

  // Token aleatorio (48 caracteres hexadecimales)
  const token = crypto.randomBytes(24).toString('hex');

  // Guardar en KV con TTL de 30 minutos
  await kv.set(`token:${token}`, { gb, used: false }, { ex: 1800 });

  res.status(200).json({ token });
}
