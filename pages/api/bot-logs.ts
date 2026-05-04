import type { NextApiRequest, NextApiResponse } from "next";

interface LogEntry {
  guildId: string;
  message: string;
  timestamp: number;
}

const logs: LogEntry[] = [];
const MAX_LOGS = 1000;
const SECRET = process.env.BOT_LOGS_SECRET || "cambia_esto_por_una_clave_segura";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo POST para enviar logs
  if (req.method === "POST") {
    const { secret, guildId, message } = req.body;
    if (secret !== SECRET) {
      return res.status(403).json({ error: "No autorizado" });
    }
    if (!guildId || !message) {
      return res.status(400).json({ error: "guildId y message son obligatorios" });
    }

    const entry: LogEntry = {
      guildId,
      message,
      timestamp: Date.now(),
    };
    logs.push(entry);
    if (logs.length > MAX_LOGS) logs.shift();

    return res.status(200).json({ success: true });
  }

  // GET para obtener logs por guildId
  if (req.method === "GET") {
    const { guildId } = req.query;
    if (!guildId || typeof guildId !== "string") {
      return res.status(400).json({ error: "guildId requerido" });
    }
    const filtered = logs
      .filter((log) => log.guildId === guildId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 200); // últimos 200
    return res.status(200).json({ logs: filtered.map((l) => l.message) });
  }

  return res.status(405).json({ error: "Método no permitido" });
}
