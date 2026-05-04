import type { NextApiRequest, NextApiResponse } from 'next';
import { addRecentGuild } from './recent-guilds';

const configStore: Record<string, any> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const {
    guildId,
    guildName,
    guildIcon,
    botNickname,
    ...settings
  } = req.body;

  if (!guildId) return res.status(400).json({ error: 'guildId requerido' });

  // Verificar y consumir almacenamiento (15 GB por guardado)
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  try {
    const storageRes = await fetch(`${baseUrl}/api/guild-storage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guildId, addGB: 15 }),
    });
    if (!storageRes.ok) {
      const errData = await storageRes.json();
      return res.status(403).json({ error: errData.error || 'Sin espacio suficiente' });
    }
  } catch (error) {
    console.error('Error al verificar almacenamiento:', error);
    return res.status(500).json({ error: 'Error interno al verificar almacenamiento' });
  }

  // Guardar configuración
  configStore[guildId] = { ...configStore[guildId], ...settings, botNickname };

  // Registrar como reciente
  addRecentGuild(guildId, guildName || 'Servidor desconocido', guildIcon || null);

  // Cambiar apodo del bot si se especificó
  if (botNickname && botNickname.trim() !== '') {
    try {
      const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/@me`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nick: botNickname.trim() }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('Error al cambiar apodo:', errData);
        return res.status(200).json({
          success: true,
          warning: 'Configuración guardada, pero no se pudo cambiar el apodo. ¿Tiene el bot permiso de “Cambiar apodo”?',
        });
      }
    } catch (error) {
      console.error('Error al cambiar apodo:', error);
      return res.status(200).json({
        success: true,
        warning: 'Configuración guardada, pero ocurrió un error al cambiar el apodo.',
      });
    }
  }

  return res.status(200).json({ success: true });
}
