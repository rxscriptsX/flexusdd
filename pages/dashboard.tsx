import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getUserAdminGuilds } from "../lib/discord";
import ServerCard from "../components/ServerCard";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.accessToken) {
      getUserAdminGuilds(session.accessToken).then((guilds) => {
        setGuilds(guilds);
        setLoading(false);
      });
    }
  }, [session]);

  if (loading) return <div>Cargando servidores...</div>;

  return (
    <div>
      <h1>Mis Servidores</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {guilds.map((guild: any) => (
          <ServerCard key={guild.id} guild={guild} />
        ))}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
