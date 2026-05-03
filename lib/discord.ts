// lib/discord.ts
// Tipos básicos (puedes expandirlos)
interface DiscordGuild {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: number;
}

export async function getUserAdminGuilds(accessToken: string): Promise<DiscordGuild[]> {
  // 1. Obtener los servidores del usuario
  const userGuilds: DiscordGuild[] = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then(res => res.json());

  // 2. Obtener los servidores donde está el bot
  const botGuilds: DiscordGuild[] = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
  }).then(res => res.json());

  // 3. Filtrar solo aquellos donde el usuario es administrador (permissions & 0x8)
  const adminGuilds = userGuilds.filter(guild => (guild.permissions & 0x8) === 0x8);

  // 4. Intersección: servidores comunes entre el bot y el usuario admin
  const botGuildIds = new Set(botGuilds.map(g => g.id));
  return adminGuilds.filter(guild => botGuildIds.has(guild.id));
}
