import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    userGuilds?: any[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    guilds?: any[];
  }
}
