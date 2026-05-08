import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session) {
      // Pequeño retardo para no saturar la redirección
      const timer = setTimeout(() => router.push("/dashboard"), 300);
      return () => clearTimeout(timer);
    }
  }, [session, status, router]);

  // Mientras carga la sesión, no redirigimos
  if (status === "loading") return <p style={{ color: "white" }}>Cargando...</p>;

  return (
    <div style={{ /* tus estilos */ }}>
      <h1>Iniciar sesión en FLEXUS Dashboard</h1>
      <button onClick={() => signIn("discord")}>
        Iniciar sesión con Discord
      </button>
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
