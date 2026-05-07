import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { getToken } from 'next-auth/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.sub) return res.status(401).json({ error: 'No autorizado' });

  const userId = token.sub as string;
  const servers = await kv.smembers(`user:${userId}:servers`);
  res.status(200).json({ servers });
}
