import type { NextApiRequest, NextApiResponse } from 'next';
import { addRecentGuild } from './recent-guilds';
import { addStorage } from '../../lib/storage';

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

  // Consumir 15 GB en Redis (persistente)
  const storageResult = await addStorage(guildId, 15);
  if (!storageResult.success) {
    return res.status(403).json({ error: storageResult.error || 'Sin espacio suficiente' });
  }

  // Guardar configuración (en memoria; puedes migrar a BD más adelante)
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
