import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import GuildSettings from "../../components/GuildSettings";

export default function GuildDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query; // ID del servidor
  const [guild, setGuild] = useState<any>(null);

  useEffect(() => {
    if (id && session?.accessToken) {
      fetch(`https://discord.com/api/guilds/${id}`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
      })
        .then((res) => res.json())
        .then((data) => setGuild(data));
    }
  }, [id, session]);

  if (!guild) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Configuración de {guild.name}</h1>
      <GuildSettings guildId={id as string} />
    </div>
  );
}
