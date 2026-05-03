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
      setLoading(true);
      getUserAdminGuilds(session.accessToken)
        .then((guilds) => {
          setGuilds(guilds);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Error al cargar los servidores.");
          setLoading(false);
        });
    } else if (status === "authenticated" && !session?.accessToken) {
      setError("No se encontró el token de Discord. Revisa la configuración.");
      setLoading(false);
    }
  }, [session, status]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🌐 Mis Servidores</h1>

      {loading && <p style={styles.loading}>⏳ Cargando servidores...</p>}

      {error && <div style={styles.errorBox}>❌ {error}</div>}

      {!loading && !error && guilds.length === 0 && (
        <div style={styles.empty}>
          <p>No tienes servidores en común con el bot donde seas administrador.</p>
          <p style={{ fontSize: "0.9rem", color: "#99aab5" }}>
            Invita a tu bot a un servidor y asegúrate de tener permisos de administrador.
          </p>
        </div>
      )}

      {!loading && !error && guilds.length > 0 && (
        <div style={styles.guildGrid}>
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

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem 1rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#ffffff",
    backgroundColor: "#23272a",
    minHeight: "100vh",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "2rem",
    color: "#5865f2",
    textAlign: "center" as const,
  },
  loading: {
    textAlign: "center" as const,
    fontSize: "1.2rem",
    color: "#99aab5",
  },
  errorBox: {
    backgroundColor: "rgba(237, 66, 69, 0.2)",
    border: "1px solid #ed4245",
    borderRadius: "8px",
    padding: "1rem",
    margin: "1rem 0",
    color: "#ed4245",
    textAlign: "center" as const,
  },
  empty: {
    textAlign: "center" as const,
    backgroundColor: "#2c2f33",
    padding: "2rem",
    borderRadius: "12px",
    fontSize: "1.1rem",
    color: "#99aab5",
  },
  guildGrid: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "1.5rem",
    justifyContent: "center",
  },
};
