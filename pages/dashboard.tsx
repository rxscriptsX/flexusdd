import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getUserAdminGuilds } from "../lib/discord";
import ServerCard from "../components/ServerCard";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guilds, setGuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.accessToken) {
      console.log("Access token disponible:", session.accessToken.substring(0, 10) + "...");
      getUserAdminGuilds(session.accessToken)
        .then((guilds) => {
          console.log("Servidores obtenidos:", guilds);
          setGuilds(guilds);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error obteniendo servidores:", err);
          setError(err.message || "Error desconocido");
          setLoading(false);
        });
    } else if (status === "authenticated" && !session?.accessToken) {
      console.error("No hay accessToken en la sesión");
      setError("No se pudo obtener el token de Discord. Revisa la configuración de NextAuth.");
      setLoading(false);
    }
  }, [session, status]);

  if (loading) return <div>Cargando servidores...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div>
      <h1>Mis Servidores</h1>
      {guilds.length === 0 ? (
        <p>No tienes servidores en común con el bot donde seas administrador.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {guilds.map((guild: any) => (
            <ServerCard key={guild.id} guild={guild} />
          ))}
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
