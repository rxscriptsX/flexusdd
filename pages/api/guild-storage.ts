import type { NextApiRequest, NextApiResponse } from 'next';

interface StorageInfo {
  [guildId: string]: number; // GB usados
}

const storageUsed: StorageInfo = {};
const MAX_GB = 128;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { guildId } = req.query;
    if (!guildId || typeof guildId !== 'string') {
      return res.status(400).json({ error: 'guildId requerido' });
    }
    const used = storageUsed[guildId] || 0;
    return res.status(200).json({ used, max: MAX_GB, free: MAX_GB - used });
  }

  if (req.method === 'POST') {
    const { guildId, addGB } = req.body;
    if (!guildId || typeof guildId !== 'string' || addGB === undefined || typeof addGB !== 'number') {
      return res.status(400).json({ error: 'Datos inválidos' });
    }
    const current = storageUsed[guildId] || 0;
    if (current + addGB > MAX_GB) {
      return res.status(403).json({ error: 'Almacenamiento insuficiente. No puedes gastar más GB.' });
    }
    storageUsed[guildId] = current + addGB;
    return res.status(200).json({ used: storageUsed[guildId], free: MAX_GB - storageUsed[guildId] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
