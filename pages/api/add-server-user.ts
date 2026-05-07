import { kv } from '@vercel/kv';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) return res.status(401).json({ error: 'No autorizado' });

  const { name, userId } = req.body;
  const key = `server:${name}:data`;
  const data: any = await kv.get(key);
  if (!data || data.owner !== token.sub) return res.status(403).json({ error: 'No eres el propietario' });

  if (!data.users.includes(userId)) {
    data.users.push(userId);
    await kv.set(key, data);
  }
  return res.status(200).json({ success: true });
}
