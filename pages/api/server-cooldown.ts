import { kv } from '@vercel/kv';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ cooldown: false });
  const exists = await kv.get(`create-server-cooldown:${userId}`);
  return res.status(200).json({ cooldown: !!exists });
}
