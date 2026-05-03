import type { NextApiRequest, NextApiResponse } from "next";

// Almacenamiento temporal en memoria (cámbialo por una base de datos real en producción)
const configStore: Record<string, any> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { guildId } = req.query;
    if (!guildId || typeof guildId !== "string") return res.status(400).json({ error: "guildId requerido" });
    const config = configStore[guildId] || {};
    return res.status(200).json(config);
  }

  if (req.method === "POST") {
    const { guildId, ...data } = req.body;
    if (!guildId) return res.status(400).json({ error: "guildId requerido" });
    configStore[guildId] = { ...configStore[guildId], ...data };
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Método no permitido" });
}
