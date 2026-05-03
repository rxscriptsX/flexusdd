import { ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Layout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#23272a", color: "white" }}>
      <nav style={styles.nav}>
        <Link href="/dashboard" style={styles.brand}>FLEXUS Dashboard</Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {session && (
            <>
              <span style={{ color: "#99aab5" }}>{session.user?.name}</span>
              <button onClick={() => signOut({ callbackUrl: "/" })} style={styles.logoutBtn}>
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </nav>
      <main style={{ padding: "2rem 1rem" }}>{children}</main>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "#2c2f33",
    borderBottom: "1px solid #40444b",
  },
  brand: {
    color: "#5865f2",
    fontWeight: "bold",
    fontSize: "1.2rem",
    textDecoration: "none",
  },
  logoutBtn: {
    background: "none",
    border: "1px solid #ed4245",
    color: "#ed4245",
    padding: "0.3rem 0.8rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
};
