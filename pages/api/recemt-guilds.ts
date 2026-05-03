import type { NextApiRequest, NextApiResponse } from "next";

interface RecentEntry {
  id: string;
  name: string;
  icon: string | null;
  lastModified: number;
}

const recentGuilds: RecentEntry[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const sorted = recentGuilds
      .sort((a, b) => b.lastModified - a.lastModified)
      .slice(0, 5);
    return res.status(200).json(sorted);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// Función para añadir/actualizar un gremio reciente (llamada desde save-config)
export function addRecentGuild(guildId: string, guildName?: string, guildIcon?: string | null) {
  const existing = recentGuilds.find((g) => g.id === guildId);
  if (existing) {
    existing.lastModified = Date.now();
    if (guildName) existing.name = guildName;
    if (guildIcon !== undefined) existing.icon = guildIcon;
  } else {
    recentGuilds.push({
      id: guildId,
      name: guildName || "Servidor desconocido",
      icon: guildIcon || null,
      lastModified: Date.now(),
    });
  }
}
