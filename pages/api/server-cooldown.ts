import { kv } from '@vercel/kv';
import type { NextApiRequest, NextApiResponse } from 'next';

const COOLDOWN_SECONDS = 30;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') return res.status(400).json({ cooldown: false, remaining: 0 });

  const cooldownKey = `create-server-cooldown:${userId}`;
  const ts = await kv.get<number>(cooldownKey);
  if (!ts) return res.status(200).json({ cooldown: false, remaining: 0 });

  const remaining = Math.ceil((ts + COOLDOWN_SECONDS * 1000 - Date.now()) / 1000);
  if (remaining <= 0) {
    // Cooldown expirado, limpiar la llave
    await kv.del(cooldownKey);
    return res.status(200).json({ cooldown: false, remaining: 0 });
  }

  return res.status(200).json({ cooldown: true, remaining });
}
