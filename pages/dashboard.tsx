import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, FormEvent, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [serverId, setServerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [recentGuilds, setRecentGuilds] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Captcha states
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState({ num1: 0, num2: 0, result: 0 });
  const [captchaError, setCaptchaError] = useState(false);

  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await fetch("/api/recent-guilds");
        if (res.ok) {
          const data = await res.json();
          setRecentGuilds(data);
        }
      } catch (error) {
        console.error("Error cargando recientes:", error);
      } finally {
        setLoadingRecent(false);
      }
    }
    if (status === "authenticated") {
      fetchRecent();
    }
  }, [status]);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ num1, num2, result: num1 + num2 });
    setCaptchaAnswer("");
    setCaptchaError(false);
  };

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }
  if (status === "loading") return <p style={{ color: "white" }}>Cargando sesión...</p>;

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!serverId.trim()) return;

    // Si no se ha verificado, mostrar captcha
    if (!captchaRequired) {
      setCaptchaRequired(true);
      generateCaptcha();
      return;
    }

    // Verificar captcha
    if (parseInt(captchaAnswer) !== captchaQuestion.result) {
      setCaptchaError(true);
      return;
    }

    // Limpiar estados de captcha
    setCaptchaRequired(false);
    setCaptchaError(false);
    setCaptchaAnswer("");

    // Proceder con búsqueda
    setLoading(true);
    setSearched(false);
    setResults([]);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const res = await fetch(`/api/server-info?id=${encodeURIComponent(serverId.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al buscar el servidor");
      if (data.exists) {
        setResults([data]);
      } else {
        setResults([{ exists: false, id: serverId.trim(), name: "Servidor desconocido", icon: null }]);
      }
    } catch (error: any) {
      console.error("Error en la búsqueda:", error);
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const inviteUrl = (guildId: string) =>
    `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "1459326358248231115"}&scope=bot&permissions=8&guild_id=${guildId}`;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", color: "#ffffff" }}>
      <h1 style={{ textAlign: "center", color: "#5865f2", marginBottom: "2rem" }}>🔍 Buscar Servidor</h1>

      <form onSubmit={handleSearch} style={formStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          <label style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#b9bbbe", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            ID del servidor
            <span title="Para obtener el ID del servidor, activa el Modo Desarrollador en Discord (Ajustes > Avanzado), luego clic derecho en el servidor > Copiar ID." style={{ cursor: "pointer", fontSize: "0.8rem", color: "#5865f2" }}>ⓘ</span>
          </label>
          <input
            type="text"
            value={serverId}
            onChange={(e) => setServerId(e.target.value)}
            placeholder="Ej: 123456789012345678"
            style={inputStyle}
            disabled={loading || captchaRequired}
          />
        </div>

        {captchaRequired && (
          <div style={{ backgroundColor: "#36393f", padding: "1rem", borderRadius: "8px", border: "1px solid #5865f2" }}>
            <p style={{ margin: "0 0 0.5rem", fontWeight: "bold" }}>🤖 Verificación: ¿Eres humano?</p>
            <p style={{ margin: "0 0 0.5rem" }}>Resuelve: {captchaQuestion.num1} + {captchaQuestion.num2} = ?</p>
            <input
              type="number"
              value={captchaAnswer}
              onChange={(e) => { setCaptchaAnswer(e.target.value); setCaptchaError(false); }}
              style={inputStyle}
              placeholder="Resultado"
              autoFocus
            />
            {captchaError && <p style={{ color: "#ed4245", margin: "0.3rem 0 0", fontSize: "0.85rem" }}>Respuesta incorrecta. Intenta de nuevo.</p>}
          </div>
        )}

        <button type="submit" style={buttonStyle} disabled={loading || !serverId.trim()}>
          {loading ? "⏳ Pensando..." : captchaRequired ? "Verificar y buscar" : "Siguiente"}
        </button>
      </form>

      {searched && !loading && (
        <div style={{ marginTop: "1rem" }}>
          {results.length === 0 ? (
            <p style={{ textAlign: "center", color: "#99aab5", backgroundColor: "#2c2f33", padding: "1.5rem", borderRadius: "12px" }}>
              No se encontraron servidores con ese ID.
            </p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "center" }}>
              {results.map((guild: any) => (
                <GuildCard key={guild.id} guild={guild} inviteUrl={inviteUrl} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Servidores recientes */}
      <div style={{ marginTop: "3rem" }}>
        <h2 style={{ textAlign: "center", color: "#b9bbbe", marginBottom: "1rem" }}>🕒 Servidores recientes</h2>
        {loadingRecent ? (
          <p style={{ textAlign: "center", color: "#99aab5" }}>Cargando...</p>
        ) : recentGuilds.length === 0 ? (
          <p style={{ textAlign: "center", color: "#99aab5", backgroundColor: "#2c2f33", padding: "1.5rem", borderRadius: "12px" }}>
            No has configurado ningún servidor recientemente.
          </p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "center" }}>
            {recentGuilds.map((guild: any) => (
              <GuildCard key={guild.id} guild={{ ...guild, exists: true }} inviteUrl={inviteUrl} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GuildCard({ guild, inviteUrl }: { guild: any; inviteUrl: (id: string) => string }) {
  const iconUrl = guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
    : null;

  return (
    <div style={cardStyle}>
      {!guild.exists ? (
        <div style={{ color: "#ed4245", fontWeight: "bold", fontSize: "1.2rem", marginBottom: "1rem" }}>
          Servidor desconocido
        </div>
      ) : (
        <>
          {iconUrl && <Image src={iconUrl} alt={guild.name} width={64} height={64} style={{ borderRadius: "50%", marginBottom: "0.5rem" }} />}
          <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0.3rem 0", wordBreak: "break-word" }}>{guild.name}</h3>
          <div style={{ margin: "0.5rem 0" }}>
            <span style={{ backgroundColor: "#faa61a", color: "#000", padding: "0.2rem 0.8rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold" }}>Bot Active</span>
          </div>
          <Link href={`/ddservers/${guild.id}`} style={{ marginTop: "0.5rem", backgroundColor: "#5865f2", color: "white", padding: "0.5rem 1rem", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", display: "inline-block" }}>
            Manage Server
          </Link>
        </>
      )}
      {!guild.exists && (
        <a href={inviteUrl(guild.id)} target="_blank" rel="noopener noreferrer" style={{ marginTop: "0.5rem", backgroundColor: "#3ba55c", color: "white", padding: "0.5rem 1rem", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", display: "inline-block" }}>
          Add to Server
        </a>
      )}
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.2rem",
  backgroundColor: "#2c2f33",
  padding: "2rem",
  borderRadius: "12px",
  marginBottom: "2rem",
};

const inputStyle: React.CSSProperties = {
  padding: "0.7rem 1rem",
  borderRadius: "8px",
  border: "1px solid #40444b",
  backgroundColor: "#40444b",
  color: "white",
  fontSize: "1rem",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  padding: "0.8rem",
  backgroundColor: "#5865f2",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "1rem",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#2c2f33",
  borderRadius: "16px",
  padding: "1.5rem",
  width: "220px",
  textAlign: "center",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
