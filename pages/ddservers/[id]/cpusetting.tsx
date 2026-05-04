import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Stats {
  cpu: string;
  memory: string;
  disk: string;
  network: string;
  uptime: string;
}

export default function CPUSetting() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id: guildId } = router.query as { id: string };

  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guildId) return;

    async function fetchData() {
      try {
        const resStats = await fetch(`/api/bot-resources?guildId=${guildId}`);
        if (resStats.ok) {
          const data = await resStats.json();
          setStats(data.stats || null);
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error("Error obteniendo recursos del bot:", err);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchData();
    }
  }, [guildId, status]);

  if (status === "loading") return <p style={{ color: "white" }}>Cargando sesión...</p>;
  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", color: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ color: "#5865f2", margin: 0 }}>🖥️ Monitoreo del Bot</h1>
        <Link href={`/ddservers/${guildId}`} style={{ color: "#99aab5", textDecoration: "none", fontSize: "0.95rem" }}>
          ← Volver a configuración
        </Link>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#99aab5" }}>Cargando recursos...</p>
      ) : (
        <>
          {/* Tarjetas de recursos */}
          <div style={styles.grid}>
            <ResourceCard title="CPU" value={stats?.cpu ?? "N/D"} icon="⚙️" />
            <ResourceCard title="Memoria" value={stats?.memory ?? "N/D"} icon="🧠" />
            <ResourceCard title="Disco" value={stats?.disk ?? "N/D"} icon="💾" />
            <ResourceCard title="Red" value={stats?.network ?? "N/D"} icon="🌐" />
            <ResourceCard title="Uptime" value={stats?.uptime ?? "N/D"} icon="⏱️" />
          </div>

          {/* Logs */}
          <div style={styles.logSection}>
            <h2 style={{ color: "#b9bbbe", marginBottom: "1rem" }}>📋 Logs del bot en este servidor</h2>
            <div style={styles.logBox}>
              {logs.length === 0 ? (
                <p style={{ color: "#72767d", fontStyle: "italic" }}>No hay logs recientes.</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} style={styles.logEntry}>
                    <span style={{ color: "#99aab5", marginRight: "0.5rem" }}>{i + 1}.</span>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ResourceCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div style={styles.card}>
      <div style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>{icon}</div>
      <div style={{ fontSize: "0.9rem", color: "#99aab5", marginBottom: "0.2rem" }}>{title}</div>
      <div style={{ fontSize: "1.3rem", fontWeight: "bold", color: "white" }}>{value}</div>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  card: {
    backgroundColor: "#2c2f33",
    borderRadius: "12px",
    padding: "1.2rem",
    textAlign: "center" as const,
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  },
  logSection: {
    backgroundColor: "#2c2f33",
    borderRadius: "12px",
    padding: "1.5rem",
  },
  logBox: {
    backgroundColor: "#1e2124",
    borderRadius: "8px",
    padding: "1rem",
    maxHeight: "300px",
    overflowY: "auto" as const,
    fontFamily: "monospace",
    fontSize: "0.9rem",
    lineHeight: "1.6",
  },
  logEntry: {
    padding: "0.2rem 0",
    borderBottom: "1px solid #2f3136",
  },
};
