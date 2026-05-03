export interface DiscordGuild {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: number;
}

export async function getUserAdminGuilds(accessToken: string): Promise<DiscordGuild[]> {
  try {
    // 1. Servidores del usuario
    const userRes = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) {
      console.error("Error al obtener guilds del usuario:", userRes.status);
      return [];
    }
    const userGuilds = await userRes.json();
    if (!Array.isArray(userGuilds)) {
      console.error("userGuilds no es un array:", userGuilds);
      return [];
    }

    // 2. Servidores donde está el bot
    const botRes = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
    });
    if (!botRes.ok) {
      console.error("Error al obtener guilds del bot:", botRes.status);
      return [];
    }
    const botGuilds = await botRes.json();
    if (!Array.isArray(botGuilds)) {
      console.error("botGuilds no es un array:", botGuilds);
      return [];
    }

    // 3. Filtrar administradores (permisos & 0x8)
    const adminGuilds = userGuilds.filter((guild: DiscordGuild) => (guild.permissions & 0x8) === 0x8);

    // 4. Intersección con el bot
    const botGuildIds = new Set(botGuilds.map((g: DiscordGuild) => g.id));
    const commonGuilds = adminGuilds.filter((guild: DiscordGuild) => botGuildIds.has(guild.id));

    return commonGuilds;
  } catch (error) {
    console.error("Error en getUserAdminGuilds:", error);
    return [];
  }
}
