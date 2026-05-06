import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { addMax } from '../../lib/storage';

const packToGB: Record<string, number> = {
  gb50: 50,
  gb128: 128,
  gb256: 256,
  gb512: 512,
  gb1tb: 1024,
};
const REDEEM_COOLDOWN_SECONDS = 30 * 60; // 30 minutos

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: comprobar si el usuario está en cooldown
  if (req.method === 'GET') {
    const { pack, userId } = req.query;
    if (!pack || !userId || typeof pack !== 'string' || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Parámetros inválidos' });
    }
    if (!packToGB[pack]) return res.status(400).json({ error: 'Pack no válido' });

    const cooldownKey = `redeem:${pack}:${userId}`;
    const existing = await kv.get(cooldownKey);
    return res.status(200).json({ cooldown: !!existing });
  }

  // POST: canjear
  if (req.method === 'POST') {
    const { pack, userId } = req.body;
    if (!pack || !userId || !packToGB[pack]) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    const cooldownKey = `redeem:${pack}:${userId}`;
    const existing = await kv.get(cooldownKey);
    if (existing) {
      return res.status(429).json({ error: 'Ya has canjeado este pack recientemente. Espera 30 minutos.' });
    }

    // Establecer TTL de 30 minutos
    await kv.set(cooldownKey, '1', { ex: REDEEM_COOLDOWN_SECONDS });

    // Sumar GB al usuario
    await addMax(userId, packToGB[pack]);

    return res.status(200).json({ message: `Se han añadido ${packToGB[pack]} GB correctamente.` });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
