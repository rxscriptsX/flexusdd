import { SessionProvider, useSession, signOut } from "next-auth/react";
import type { AppProps } from "next/app";
import Link from "next/link";
import { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#23272a", color: "white" }}>
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.8rem 2rem",
        backgroundColor: "#2c2f33",
        borderBottom: "1px solid #40444b",
      }}>
        <Link href="/dashboard" style={{ color: "#5865f2", fontWeight: "bold", fontSize: "1.2rem", textDecoration: "none" }}>
          FLEXUS Dashboard
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {session && (
            <>
              <span style={{ color: "#99aab5" }}>{session.user?.name}</span>
              <button onClick={() => signOut({ callbackUrl: "/" })} style={{
                background: "none",
                border: "1px solid #ed4245",
                color: "#ed4245",
                padding: "0.3rem 0.8rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}>
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </nav>
      <main style={{ flex: 1, overflow: "auto", padding: "2rem 1rem" }}>
        {children}
      </main>
    </div>
  );
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}
