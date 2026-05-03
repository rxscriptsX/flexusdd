import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
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

  if (status === "loading") return <div>Cargando...</div>;
  if (!session) {
    router.push("/login");
    return null;
  }
  if (!guild) return <div>No se pudo cargar el servidor.</div>;

  return (
    <div>
      <h1>Configuración de {guild.name}</h1>
      <GuildSettings guildId={guild.id} />
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const { id } = context.params;

  try {
    const response = await fetch(`https://discord.com/api/guilds/${id}`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    });

    if (!response.ok) {
      return { props: { guild: null } };
    }

    const guild = await response.json();
    return {
      props: {
        guild: {
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
        },
      },
    };
  } catch (error) {
    return { props: { guild: null } };
  }
}
