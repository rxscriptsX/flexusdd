// Obtener los servidores donde está el bot y el usuario es administrador
export async function getUserAdminGuilds(accessToken: string) {
  // 1. Obtener los servidores del usuario
  const userGuilds = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then((res) => res.json());

  // 2. Obtener los servidores donde está el bot
  const botGuilds = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
  }).then((res) => res.json());

  // 3. Filtrar solo aquellos donde el usuario tiene permisos de administrador
  const adminGuilds = userGuilds.filter(
    (guild: any) => (guild.permissions & 0x8) === 0x8 // 0x8 = ADMINISTRATOR
  );

  // 4. Intersección: servidores comunes entre el bot y el usuario admin
  const botGuildIds = new Set(botGuilds.map((g: any) => g.id));
  return adminGuilds.filter((g: any) => botGuildIds.has(g.id));
}
