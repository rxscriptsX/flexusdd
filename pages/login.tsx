import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (status === "authenticated" && session) {
      const timer = setTimeout(() => router.push("/dashboard"), 500);
      return () => clearTimeout(timer);
    }
  }, [session, status, router]);

  // Reloj digital
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.body}>
      {/* Fondo de partículas animadas (CSS puro) */}
      <div style={styles.particles}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${5 + Math.random() * 10}s infinite alternate`,
            boxShadow: '0 0 10px rgba(102,126,234,0.8)',
          }} />
        ))}
      </div>

      {/* Contenedor del login */}
      <div style={styles.card}>
        <div style={styles.glowEffect} />
        <div style={styles.content}>
          <div style={styles.logo}>
            🤖
            <div style={styles.glowCircle} />
          </div>
          <h1 style={styles.title}>FLEXUS</h1>
          <div style={styles.timeDisplay}>
            {time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <p style={styles.subtitle}>Dashboard de control cuántico</p>
          <div style={styles.divider} />
          <button
            onClick={() => signIn("discord")}
            style={styles.discordBtn}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
          >
            <span style={styles.btnIcon}>🔹</span>
            Iniciar sesión con Discord
          </button>
          {status === "loading" && (
            <p style={{ color: '#a0aec0', marginTop: '1rem', fontSize: '0.9rem' }}>Conectando...</p>
          )}
        </div>
      </div>

      {/* Estilos CSS inyectados */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); opacity: 0.2; }
          100% { transform: translateY(-50px); opacity: 0.6; }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

// ========== ESTILOS FUTURISTAS ==========
const styles: Record<string, React.CSSProperties> = {
  body: {
    position: 'relative',
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Segoe UI', 'Inter', system-ui, sans-serif",
  },
  particles: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    width: '420px',
    backdropFilter: 'blur(20px)',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '30px',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 0 30px rgba(102,126,234,0.2)',
    padding: '3rem 2.5rem',
    zIndex: 10,
  },
  glowEffect: {
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    background: 'linear-gradient(45deg, #667eea, #764ba2, #f093fb, #667eea)',
    backgroundSize: '400% 400%',
    zIndex: -1,
    borderRadius: '32px',
    filter: 'blur(10px)',
    opacity: 0.3,
    animation: 'gradient 5s ease infinite',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logo: {
    position: 'relative',
    fontSize: '5rem',
    marginBottom: '1rem',
    textShadow: '0 0 25px rgba(102,126,234,0.8)',
  },
  glowCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(102,126,234,0.2)',
    filter: 'blur(15px)',
    animation: 'pulse 2s infinite',
  },
  title: {
    fontSize: '2.8rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.3rem',
    letterSpacing: '2px',
  },
  timeDisplay: {
    fontSize: '1.5rem',
    fontFamily: 'monospace',
    color: '#a0aec0',
    marginBottom: '0.3rem',
    textShadow: '0 0 8px rgba(102,126,234,0.5)',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#718096',
    marginBottom: '2rem',
    fontStyle: 'italic',
    letterSpacing: '1px',
  },
  divider: {
    width: '60%',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #667eea, transparent)',
    marginBottom: '2rem',
  },
  discordBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.8rem',
    padding: '1rem 2.5rem',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #5865F2 0%, #4752c4 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '18px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 10px 20px rgba(88,101,242,0.4)',
    letterSpacing: '0.5px',
    position: 'relative',
    overflow: 'hidden',
  },
  btnIcon: {
    fontSize: '1.5rem',
  },
};

// Añadir la animación de gradiente al estilo global
const globalStyles = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

// Insertar la animación global en el componente
export function GlobalStyle() {
  return <style>{globalStyles}</style>;
}

// Incluir el estilo global
export async function getServerSideProps() {
  return { props: {} };
}
