import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Login() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.icon}>🤖</div>
        <h1 style={styles.title}>FLEXUS Dashboard</h1>
        <p style={styles.subtitle}>Inicia sesión con Discord para gestionar tu bot</p>
        <button onClick={() => signIn("discord")} style={styles.discordBtn}>
          <span style={styles.discordIcon}>🔹</span> Iniciar sesión con Discord
        </button>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
    backgroundColor: "#23272a",
  },
  card: {
    backgroundColor: "#2c2f33",
    borderRadius: "20px",
    padding: "3rem 2.5rem",
    textAlign: "center" as const,
    boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
    maxWidth: "450px",
    width: "100%",
  },
  icon: {
    fontSize: "3.5rem",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "2.2rem",
    marginBottom: "0.5rem",
    color: "#ffffff",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#99aab5",
    marginBottom: "2rem",
  },
  discordBtn: {
    backgroundColor: "#5865F2",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "1rem 2.5rem",
    fontSize: "1.3rem",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    transition: "background-color 0.2s, transform 0.1s",
    width: "100%",
  },
  discordIcon: {
    fontSize: "1.8rem",
  },
};
