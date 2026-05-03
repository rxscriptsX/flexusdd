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
    <div>
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
