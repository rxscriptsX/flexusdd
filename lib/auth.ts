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
            // Guardamos solo los servidores donde el usuario es propietario (owner: true)
            token.guilds = guilds.filter((guild: any) => guild.owner === true);
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
      session.accessToken = token.accessToken as string;
      session.userGuilds = token.guilds as any[] | undefined;
      // ✅ Añadir esta línea para exponer el ID de Discord en la sesión
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
