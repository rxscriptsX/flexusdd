import { kv } from '@vercel/kv';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  if (!name || typeof name !== 'string') return res.status(400).json({ commands: {} });
  const key = `server:${name}:commands`;
  const commands = (await kv.get(key)) as Record<string, boolean> || {};
  return res.status(200).json({ commands });
}
