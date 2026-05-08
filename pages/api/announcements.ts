import { kv } from '@vercel/kv';
import type { NextApiRequest, NextApiResponse } from 'next';

interface Announcement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const key = 'announcements';

  if (req.method === 'GET') {
    const announcements = (await kv.get<Announcement[]>(key)) || [];
    return res.status(200).json(announcements);
  }

  // Verificar secreto para operaciones POST/DELETE
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  if (req.method === 'POST') {
    const { title, description, imageUrl } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Título y descripción requeridos' });
    }
    const announcements = (await kv.get<Announcement[]>(key)) || [];
    const newAnnouncement: Announcement = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      title,
      description,
      imageUrl: imageUrl || '',
      createdAt: Date.now(),
    };
    announcements.push(newAnnouncement);
    await kv.set(key, announcements);
    return res.status(201).json(newAnnouncement);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID requerido' });
    }
    let announcements = (await kv.get<Announcement[]>(key)) || [];
    announcements = announcements.filter(a => a.id !== id);
    await kv.set(key, announcements);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
