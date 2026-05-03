import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ServerCard from "../components/ServerCard";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mutualGuilds, setMutualGuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchMutualGuilds() {
      try {
        // 1. Obtenemos los servidores del bot desde nuestra API
        const botRes = await fetch("/api/bot-guilds");
        if (!botRes.ok) throw new Error("Error al obtener servidores del bot");
        const botGuilds = await botRes.json();

        // 2. Obtenemos los servidores del usuario desde la sesión (guardados en jwt)
        const userGuilds = session?.userGuilds || [];

        // 3. Creamos una intersección: servidores que aparecen en ambas listas
        const botGuildIds = new Set(botGuilds.map((g: any) => g.id));
        const commonGuilds = userGuilds.filter((guild: any) => botGuildIds.has(guild.id));

        setMutualGuilds(commonGuilds);
      } catch (err: any) {
        setError(err.message || "Error al cargar los servidores.");
      } finally {
        setLoading(false);
      }
    }

    if (session?.userGuilds) {
      fetchMutualGuilds();
    } else if (status === "authenticated" && !session?.userGuilds) {
      setError("No se encontró la lista de servidores del usuario. Revisa la configuración.");
      setLoading(false);
    }
  }, [session, status]);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem", color: "#fff", backgroundColor: "#23272a", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", color: "#5865f2", marginBottom: "2rem" }}>🌐 Mis Servidores</h1>
      {loading && <p style={{ textAlign: "center" }}>⏳ Cargando servidores...</p>}
      {error && <div style={{ backgroundColor: "rgba(237,66,69,0.2)", border: "1px solid #ed4245", borderRadius: "8px", padding: "1rem", margin: "1rem 0", color: "#ed4245", textAlign: "center" }}>❌ {error}</div>}
      {!loading && !error && mutualGuilds.length === 0 && (
        <div style={{ textAlign: "center", backgroundColor: "#2c2f33", padding: "2rem", borderRadius: "12px" }}>
          <p>No tienes servidores en común con el bot donde seas administrador.</p>
          <p style={{ fontSize: "0.9rem", color: "#99aab5" }}>Invita a tu bot a un servidor y asegúrate de tener el permiso "Administrador".</p>
        </div>
      )}
      {!loading && !error && mutualGuilds.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "center" }}>
          {mutualGuilds.map((guild: any) => (
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
