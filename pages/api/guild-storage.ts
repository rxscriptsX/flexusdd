import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserStorageInfo, addMax } from '../../lib/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId requerido' });
    }
    const info = await getUserStorageInfo(userId);
    return res.status(200).json(info);
  }

  if (req.method === 'POST') {
    const { userId, addGB } = req.body;
    if (!userId || typeof userId !== 'string' || addGB === undefined || typeof addGB !== 'number') {
      return res.status(400).json({ error: 'Datos inválidos' });
    }
    // Esta ruta POST la usará el panel de administración para sumar GB al límite
    await addMax(userId, addGB);
    const info = await getUserStorageInfo(userId);
    return res.status(200).json(info);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
