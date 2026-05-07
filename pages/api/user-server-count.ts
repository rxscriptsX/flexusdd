import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { kv } from '@vercel/kv';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.sub) return res.status(401).json({ error: 'No autorizado' });

  const userId = token.sub;
  const count = (await kv.get<number>(`user:${userId}:serverCount`)) || 0;
  return res.status(200).json({ count, cost: 49 * Math.pow(2, count) });
}
