import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { guildId } = req.query;

  if (!guildId || typeof guildId !== 'string') {
    return res.status(400).json({ error: 'guildId requerido' });
  }

  // Construir la URL base (funciona en Vercel y en desarrollo local)
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  try {
    const logsRes = await fetch(`${baseUrl}/api/bot-logs?guildId=${guildId}`);
    if (!logsRes.ok) throw new Error('Error al obtener logs');
    const data = await logsRes.json();

    return res.status(200).json({ logs: data.logs || [] });
  } catch (error) {
    console.error('Error en bot-resources:', error);
    return res.status(200).json({ logs: [] });
  }
}
