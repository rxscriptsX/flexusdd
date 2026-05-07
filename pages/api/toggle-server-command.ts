import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { getToken } from 'next-auth/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) return res.status(401).json({ error: 'No autorizado' });

  const { name, cmdName, enabled } = req.body;
  if (!name || !cmdName || typeof enabled !== 'boolean') return res.status(400).json({ error: 'Datos inválidos' });

  const key = `server:${name}:commands`;
  const commands: Record<string, boolean> = (await kv.get(key)) || {};
  commands[cmdName] = enabled;
  await kv.set(key, commands);
  return res.status(200).json({ success: true });
}
