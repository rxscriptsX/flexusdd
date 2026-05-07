import { kv } from '@vercel/kv';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  if (!name) return res.status(400).json({ commands: [] });
  const data: any = await kv.get(`server:${name}:commands`);
  return res.status(200).json({ commands: data || [] });
}
