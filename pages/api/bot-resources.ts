import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { guildId } = req.query;
  if (!guildId || typeof guildId !== "string") {
    return res.status(400).json({ error: "guildId requerido" });
  }

  // Simula datos del bot. En producción, reemplaza con un fetch a tu bot real.
  const stats = {
    cpu: `${Math.floor(Math.random() * 10) + 1}%`,
    memory: `${Math.floor(Math.random() * 500) + 100} MiB / 1024 MiB`,
    disk: `${Math.floor(Math.random() * 200) + 50} MiB / 800 MiB`,
    network: `${(Math.random() * 500 + 100).toFixed(1)} KiB ↓  ${(Math.random() * 300 + 50).toFixed(1)} KiB ↑`,
    uptime: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
  };

  // Logs simulados (vacío por defecto)
  const logs: string[] = [
    "[12:34] Comando !help ejecutado por @usuario",
    "[12:35] Comando !ban ejecutado por @moderador",
    "[12:36] Usuario @nuevo se unió al servidor",
    "[12:37] Mensaje eliminado en #general (auto-mod)",
  ];

  res.status(200).json({ stats, logs });
}
