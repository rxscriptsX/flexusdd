import type { NextApiRequest, NextApiResponse } from 'next';
import { getStorageInfo, addStorage } from '../../lib/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { guildId } = req.query;
    if (!guildId || typeof guildId !== 'string') {
      return res.status(400).json({ error: 'guildId requerido' });
    }
    const info = await getStorageInfo(guildId);
    return res.status(200).json(info);
  }

  if (req.method === 'POST') {
    const { guildId, addGB } = req.body;
    if (!guildId || typeof guildId !== 'string' || addGB === undefined || typeof addGB !== 'number') {
      return res.status(400).json({ error: 'Datos inválidos' });
    }
    const result = await addStorage(guildId, addGB);
    if (!result.success) {
      return res.status(403).json({ error: result.error });
    }
    const info = await getStorageInfo(guildId);
    return res.status(200).json(info);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
