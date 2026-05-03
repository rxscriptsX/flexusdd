import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [serverId, setServerId] = useState("");
  const [serverName, setServerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  // Redirigir si no está autenticado
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }
  if (status === "loading") return <p>Cargando sesión...</p>;

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(false);
    setResults([]);

    // Simulamos un pequeño "pensar" (1.5s)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      if (serverId.trim()) {
        // Búsqueda por ID
        const res = await fetch(`/api/server-info?id=${encodeURIComponent(serverId.trim())}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al buscar el servidor");
        if (data.exists) {
          setResults([data]);
        } else {
          // Si no existe, mostramos igual con exists: false para ofrecer añadir
          setResults([{ exists: false, id: serverId.trim(), name: "Servidor desconocido", icon: null }]);
        }
      } else if (serverName.trim()) {
        // Búsqueda por nombre: obtenemos todos los servidores del bot
        const res = await fetch("/api/bot-guilds");
        if (!res.ok) throw new Error("Error al obtener la lista del bot");
        const botGuilds = await res.json();
        const filtered = botGuilds.filter((g: any) =>
          g.name.toLowerCase().includes(serverName.trim().toLowerCase())
        );
        setResults(filtered.map((g: any) => ({ ...g, exists: true })));
      }
    } catch (error: any) {
      console.error("Error en la búsqueda:", error);
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // Construir URL de invitación con guild_id
  const inviteUrl = (guildId: string) =>
    `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "1459326358248231115"}&scope=bot&permissions=8&guild_id=${guildId}`;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔍 Buscar Servidor</h1>

      <form onSubmit={handleSearch} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>ID del servidor</label>
          <input
            type="text"
            value={serverId}
            onChange={(e) => setServerId(e.target.value)}
            placeholder="Ej: 123456789012345678"
            style={styles.input}
            disabled={loading}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Nombre del servidor</label>
          <input
            type="text"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            placeholder="Ej: Mi Servidor"
            style={styles.input}
            disabled={loading}
          />
        </div>
        <button type="submit" style={styles.button} disabled={loading || (!serverId.trim() && !serverName.trim())}>
          {loading ? "⏳ Pensando..." : "Siguiente"}
        </button>
      </form>

      {searched && !loading && (
        <div style={styles.results}>
          {results.length === 0 ? (
            <p style={styles.noResults}>No se encontraron servidores con esos datos.</p>
          ) : (
            <div style={styles.guildGrid}>
              {results.map((guild: any) => {
                const iconUrl = guild.icon
                  ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(guild.name || "?")}&background=5865f2&color=fff&size=128`;

                return (
                  <div key={guild.id} style={styles.card}>
                    <Image src={iconUrl} alt={guild.name} width={64} height={64} style={styles.icon} />
                    <h3 style={styles.guildName}>{guild.name}</h3>
                    <div style={{ margin: "0.5rem 0" }}>
                      {guild.exists ? (
                        <span style={styles.botActive}>Bot Active</span>
                      ) : (
                        <span style={styles.botNotConfigured}>Not Configured</span>
                      )}
                    </div>
                    {guild.exists ? (
                      <Link href={`/ddservers/${guild.id}`} style={styles.manageButton}>
                        Manage Server
                      </Link>
                    ) : (
                      <a
                        href={inviteUrl(guild.id)}
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
      )}
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}

const styles = {
  container: {
    maxWidth: "800px",
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
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.2rem",
    backgroundColor: "#2c2f33",
    padding: "2rem",
    borderRadius: "12px",
    marginBottom: "2rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.3rem",
  },
  label: {
    fontSize: "0.95rem",
    fontWeight: "bold",
    color: "#b9bbbe",
  },
  input: {
    padding: "0.7rem 1rem",
    borderRadius: "8px",
    border: "1px solid #40444b",
    backgroundColor: "#40444b",
    color: "white",
    fontSize: "1rem",
    outline: "none",
  },
  button: {
    padding: "0.8rem",
    backgroundColor: "#5865f2",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background-color 0.2s",
  },
  results: {
    marginTop: "1rem",
  },
  noResults: {
    textAlign: "center" as const,
    color: "#99aab5",
    backgroundColor: "#2c2f33",
    padding: "1.5rem",
    borderRadius: "12px",
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
