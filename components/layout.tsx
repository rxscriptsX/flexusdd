import { ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Layout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#23272a", color: "white" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", padding: "1rem", backgroundColor: "#2c2f33" }}>
        <Link href="/dashboard">FLEXUS Dashboard</Link>
        {session && (
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ background: "none", border: "1px solid white", color: "white", padding: "0.3rem 0.8rem", borderRadius: "4px", cursor: "pointer" }}>
            Cerrar sesión ({session.user?.name})
          </button>
        )}
      </nav>
      <main style={{ padding: "2rem" }}>{children}</main>
    </div>
  );
}
