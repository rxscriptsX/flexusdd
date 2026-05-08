import { SessionProvider, useSession, signOut } from "next-auth/react";
import type { AppProps } from "next/app";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

const ADMIN_ID = '1313950667773055010';

function Layout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [showAdmin, setShowAdmin] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = session?.user?.id === ADMIN_ID;

  const fetchAnnouncements = async () => {
    const res = await fetch('/api/announcements');
    const data = await res.json();
    setAnnouncements(data);
  };

  useEffect(() => {
    if (showAdmin) fetchAnnouncements();
  }, [showAdmin]);

  const handleAdminButton = () => {
    const password = prompt('Introduce la contraseña de administrador:');
    const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'onlyalex';
    if (password === adminSecret) {
      setShowAdmin(true);
    } else if (password !== null) {
      alert('Contraseña incorrecta');
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!title.trim() || !description.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET || 'onlyalex',
        },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), imageUrl: imageUrl.trim() }),
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        setImageUrl('');
        fetchAnnouncements();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/announcements?id=${id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET || 'onlyalex',
      },
    });
    fetchAnnouncements();
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#23272a", color: "white" }}>
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 2rem",
        backgroundColor: "#2c2f33", borderBottom: "1px solid #40444b",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link href="/dashboard" style={{ color: "#5865f2", fontWeight: "bold", fontSize: "1.2rem", textDecoration: "none" }}>FLEXUS Dashboard</Link>
          <Link href="/servers/gbshop" style={{ color: "#faa61a", fontWeight: "bold", textDecoration: "none", fontSize: "0.95rem" }}>GB Shop</Link>
          <Link href="/perm/servers/users" style={{ color: "#3ba55c", fontWeight: "bold", textDecoration: "none", fontSize: "0.95rem" }}>Servers</Link>
          <Link href="/server/dashboard" style={{ color: "#ff6b6b", fontWeight: "bold", textDecoration: "none", fontSize: "0.95rem" }}>Servers Dashboard</Link>
          <Link href="/news/flexus" style={{ color: "#fbbf24", fontWeight: "bold", textDecoration: "none", fontSize: "0.95rem" }}>News</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {session && (
            <>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: "1.2" }}>
                <span style={{ color: "#99aab5", fontSize: "0.85rem" }}>{session.user?.name}</span>
                <span style={{ color: "#72767d", fontSize: "0.7rem", fontFamily: "monospace" }}>ID: {session.user?.id ?? "Desconocido"}</span>
              </div>
              <button onClick={() => signOut({ callbackUrl: "/" })} style={{ background: "none", border: "1px solid #ed4245", color: "#ed4245", padding: "0.3rem 0.8rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem" }}>Cerrar sesión</button>
            </>
          )}
        </div>
      </nav>
      <main style={{ flex: 1, overflow: "auto", padding: "2rem 1rem" }}>{children}</main>

      {/* Botón "=" solo para el admin */}
      {isAdmin && (
        <button
          onClick={handleAdminButton}
          style={{
            position: 'fixed', bottom: '20px', right: '20px',
            background: 'rgba(0,0,0,0.4)', border: '1px solid #5865f2', borderRadius: '50%',
            width: '40px', height: '40px', color: '#5865f2', fontSize: '1.5rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          title="Administrar anuncios"
        >
          =
        </button>
      )}

      {/* Modal de administración de anuncios */}
      {showAdmin && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 2000,
        }}>
          <div style={{
            backgroundColor: '#2c2f33', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)', maxHeight: '80vh', overflowY: 'auto',
          }}>
            <h2 style={{ color: '#5865f2', marginTop: 0 }}>Administrar Anuncios</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h4>Crear nuevo anuncio</h4>
              <input
                type="text" placeholder="Título" value={title}
                onChange={e => setTitle(e.target.value)}
                style={{
                  width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #40444b',
                  backgroundColor: '#40444b', color: 'white', fontSize: '0.95rem', outline: 'none',
                  marginBottom: '0.5rem', boxSizing: 'border-box',
                }}
              />
              <textarea
                placeholder="Descripción" value={description}
                onChange={e => setDescription(e.target.value)} rows={4}
                style={{
                  width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #40444b',
                  backgroundColor: '#40444b', color: 'white', fontSize: '0.95rem', outline: 'none',
                  marginBottom: '0.5rem', resize: 'vertical', boxSizing: 'border-box',
                }}
              />
              <input
                type="text" placeholder="URL de la imagen (opcional)" value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                style={{
                  width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #40444b',
                  backgroundColor: '#40444b', color: 'white', fontSize: '0.95rem', outline: 'none',
                  marginBottom: '0.5rem', boxSizing: 'border-box',
                }}
              />
              <button
                onClick={handleCreateAnnouncement} disabled={loading}
                style={{
                  backgroundColor: '#5865f2', color: 'white', border: 'none', borderRadius: '8px',
                  padding: '0.8rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', width: '100%',
                }}
              >
                {loading ? 'Publicando...' : 'Publicar Anuncio'}
              </button>
            </div>

            <div>
              <h4>Anuncios publicados</h4>
              {announcements.length === 0 && <p style={{ color: '#99aab5' }}>No hay anuncios.</p>}
              {announcements.map((a: any) => (
                <div key={a.id} style={{
                  backgroundColor: '#40444b', borderRadius: '8px', padding: '0.8rem', marginBottom: '0.8rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <strong>{a.title}</strong>
                    <p style={{ margin: '0.3rem 0', fontSize: '0.9rem', color: '#b9bbbe' }}>
                      {a.description.substring(0, 100)}...
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    style={{ background: 'none', border: 'none', color: '#ed4245', cursor: 'pointer', fontSize: '1.2rem' }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAdmin(false)}
              style={{
                backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '8px', padding: '0.8rem',
                fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', width: '100%', marginTop: '1rem',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
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
