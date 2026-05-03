import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allServers, setAllServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function loadServers() {
      try {
        // 1. Obtener los servidores del bot desde nuestra API
        const botRes = await fetch("/api/bot-guilds");
        if (!botRes.ok) {
          const errData = await botRes.json();
          throw new Error(errData.error || "Error al obtener servidores del bot");
        }
        const botGuilds = await botRes.json();
        const botGuildIds = new Set(botGuilds.map((g: any) => g.id));

        // 2. Servidores del usuario (propietario) desde la sesión
        const userServers = session?.userGuilds || [];

        // 3. Construir lista combinada con estado del bot
        const serversWithStatus = userServers.map((guild: any) => ({
          ...guild,
          botIn: botGuildIds.has(guild.id),
        }));

        setAllServers(serversWithStatus);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    if (session?.userGuilds) {
      loadServers();
    } else if (status === "authenticated" && !session?.userGuilds) {
      setError("No se encontraron servidores. Es posible que no seas propietario de ninguno.");
      setLoading(false);
    }
  }, [session, status]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🌐 Mis Servidores</h1>

      {loading && <p style={styles.loading}>⏳ Cargando servidores...</p>}

      {error && <div style={styles.errorBox}>❌ {error}</div>}

      {!loading && !error && allServers.length === 0 && (
        <div style={styles.empty}>
          <p>No tienes servidores donde seas el propietario.</p>
          <p style={{ fontSize: "0.9rem", color: "#99aab5" }}>Crea un servidor o transfiere la propiedad para verlo aquí.</p>
        </div>
      )}

      {!loading && !error && allServers.length > 0 && (
        <div style={styles.guildGrid}>
          {allServers.map((guild: any) => {
            const iconUrl = guild.icon
              ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(guild.name)}&background=5865f2&color=fff&size=128`;

            return (
              <div key={guild.id} style={styles.card}>
                <Image src={iconUrl} alt={guild.name} width={64} height={64} style={styles.icon} />
                <h3 style={styles.guildName}>{guild.name}</h3>
                <div style={{ margin: "0.5rem 0" }}>
                  {guild.botIn ? (
                    <span style={styles.botActive}>Bot Active</span>
                  ) : (
                    <span style={styles.botNotConfigured}>Not Configured</span>
                  )}
                </div>
                {guild.botIn ? (
                  <Link href={`/ddservers/${guild.id}`} style={styles.manageButton}>
                    Manage Server
                  </Link>
                ) : (
                  <a
                    href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&scope=bot&permissions=8&guild_id=${guild.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.addButton}
                  >
                    Add to Server
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}

// Estilos inspirados en Ticket King
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
  card: {
    backgroundColor: "#2c2f33",
    borderRadius: "16px",
    padding: "1.5rem",
    width: "220px",
    textAlign: "center" as const,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  },
  icon: {
    borderRadius: "50%",
    marginBottom: "0.5rem",
  },
  guildName: {
    fontSize: "1rem",
    fontWeight: 600,
    margin: "0.3rem 0",
    wordBreak: "break-word" as const,
  },
  botActive: {
    backgroundColor: "#faa61a",
    color: "#000",
    padding: "0.2rem 0.8rem",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  botNotConfigured: {
    backgroundColor: "#5865f2",
    color: "#fff",
    padding: "0.2rem 0.8rem",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  manageButton: {
    marginTop: "0.5rem",
    backgroundColor: "#5865f2",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
    display: "inline-block",
  },
  addButton: {
    marginTop: "0.5rem",
    backgroundColor: "#3ba55c",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
    display: "inline-block",
  },
};
