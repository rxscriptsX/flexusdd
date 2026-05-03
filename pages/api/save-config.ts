import type { NextApiRequest, NextApiResponse } from "next";

const configStore: Record<string, any> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { guildId, botNickname, ...settings } = req.body;

  if (!guildId) return res.status(400).json({ error: "guildId requerido" });

  // Guardar configuración en memoria (reemplazar por BD más adelante)
  configStore[guildId] = { ...configStore[guildId], ...settings, botNickname };

  // Si se quiere cambiar el apodo del bot, lo intentamos
  if (botNickname && botNickname.trim() !== "") {
    try {
      const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/@me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nick: botNickname.trim() }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("Error al cambiar apodo:", errData);
        return res.status(200).json({
          success: true,
          warning: "Configuración guardada, pero no se pudo cambiar el apodo. ¿Tiene el bot permiso de 'Cambiar apodo'?",
        });
      }
    } catch (error) {
      console.error("Error al cambiar apodo:", error);
      return res.status(200).json({
        success: true,
        warning: "Configuración guardada, pero ocurrió un error al cambiar el apodo.",
      });
    }
  }

  return res.status(200).json({ success: true });
}
