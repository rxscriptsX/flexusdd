import type { NextApiRequest, NextApiResponse } from 'next';

const storageExtras: Record<string, number> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, extraGB } = req.body;
  if (!userId || typeof userId !== 'string' || extraGB === undefined || isNaN(Number(extraGB))) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  if (storageExtras[userId]) {
    storageExtras[userId] += Number(extraGB);
  } else {
    storageExtras[userId] = Number(extraGB);
  }

  return res.status(200).json({ success: true, totalExtra: storageExtras[userId] });
}
