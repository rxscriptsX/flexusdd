import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de servidor requerido' });
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/guilds/${id}`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    });

    if (response.status === 404) {
      return res.status(200).json({ exists: false });
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error(`Error Discord API (${response.status}):`, errorBody);
      return res.status(response.status).json({ error: 'Error al consultar el servidor' });
    }

    const guild = await response.json();
    return res.status(200).json({
      exists: true,
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
    });
  } catch (error: any) {
    console.error('Error en server-info:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
