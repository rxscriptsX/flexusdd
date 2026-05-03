import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import GuildSettings from "../../components/GuildSettings";

interface GuildData {
  id: string;
  name: string;
  icon: string;
}

interface Props {
  guild: GuildData | null;
}

export default function GuildDashboard({ guild }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return <div style={{ color: "white" }}>Cargando...</div>;
  if (!session) {
    router.push("/login");
    return null;
  }
  if (!guild) return <div style={{ color: "white" }}>No se pudo cargar el servidor.</div>;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem 1rem", color: "white", backgroundColor: "#23272a", minHeight: "100vh" }}>
      <h1 style={{ color: "#5865f2", textAlign: "center", marginBottom: "2rem" }}>
        ⚙️ Configuración de {guild.name}
      </h1>
      <GuildSettings guildId={guild.id} guildName={guild.name} />
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const { id } = context.params;
  try {
    const response = await fetch(`https://discord.com/api/v10/guilds/${id}`, {
      headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
    });
    if (!response.ok) return { props: { guild: null } };
    const guild = await response.json();
    return {
      props: {
        guild: { id: guild.id, name: guild.name, icon: guild.icon },
      },
    };
  } catch (error) {
    return { props: { guild: null } };
  }
}
