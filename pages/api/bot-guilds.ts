import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Error al obtener servidores del bot" });
    }

    const guilds = await response.json();
    res.status(200).json(guilds);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
