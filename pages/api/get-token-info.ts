import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Token requerido' });
  }

  const data = await kv.get<{ gb: number; used: boolean }>(`token:${token}`);
  if (!data || data.used) {
    return res.status(404).json({ error: 'Token inválido o ya usado' });
  }

  return res.status(200).json({ gb: data.gb });
}
