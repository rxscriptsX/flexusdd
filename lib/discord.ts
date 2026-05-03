export interface DiscordGuild {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: number;
}

export async function getUserAdminGuilds(accessToken: string): Promise<DiscordGuild[]> {
  console.log("Iniciando getUserAdminGuilds...");

  try {
    // 1. Obtener servidores del usuario
    const userRes = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      console.error("Error al obtener guilds del usuario:", userRes.status, await userRes.text());
      return [];
    }
    const userGuilds = await userRes.json();
    console.log("Servidores del usuario:", userGuilds.length, userGuilds);

    if (!Array.isArray(userGuilds)) {
      console.error("userGuilds no es un array:", userGuilds);
      return [];
    }

    // 2. Obtener servidores del bot
    const botRes = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
    });

    if (!botRes.ok) {
      console.error("Error al obtener guilds del bot:", botRes.status, await botRes.text());
      return [];
    }
    const botGuilds = await botRes.json();
    console.log("Servidores del bot:", botGuilds.length, botGuilds);

    if (!Array.isArray(botGuilds)) {
      console.error("botGuilds no es un array:", botGuilds);
      return [];
    }

    // 3. Intersección: servidores en común (sin filtrar por permisos)
    const botGuildIds = new Set(botGuilds.map((g: DiscordGuild) => g.id));
    const commonGuilds = userGuilds.filter((guild: DiscordGuild) => botGuildIds.has(guild.id));

    console.log("Servidores en común:", commonGuilds.length, commonGuilds);
    return commonGuilds;
  } catch (error) {
    console.error("Error en getUserAdminGuilds:", error);
    return [];
  }
}
