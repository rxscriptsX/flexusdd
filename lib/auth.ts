import { AuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions: AuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify guilds" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Nada más hacer login, guardamos el token de acceso
      if (account) {
        token.accessToken = account.access_token;
        token.scope = account.scope;
      }

      // Si hay token de acceso, pedimos los servidores del usuario a Discord
      if (token.accessToken) {
        try {
          const response = await fetch("https://discord.com/api/users/@me/guilds", {
            headers: { Authorization: `Bearer ${token.accessToken}` },
          });
          if (response.ok) {
            const guilds = await response.json();
            // Filtramos solo los servidores donde el usuario es administrador (bit 0x8)
            token.guilds = guilds.filter((guild: any) => (guild.permissions & 0x8) === 0x8);
          } else {
            token.guilds = [];
          }
        } catch {
          token.guilds = [];
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Pasamos el token de acceso y los servidores del usuario a la sesión
      session.accessToken = token.accessToken as string;
      session.userGuilds = token.guilds as any[] | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
