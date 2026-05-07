import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function ServerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [servers, setServers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchServers();
    }
  }, [status]);

  const fetchServers = async () => {
    try {
      const res = await fetch('/api/user-servers');
      const data = await res.json();
      if (res.ok) {
        setServers(data.servers || []);
      } else {
        setError(data.error || 'Error al obtener servidores');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) return <p style={{ color: 'white', textAlign: 'center' }}>Cargando servidores...</p>;
  if (!session) { router.push('/login'); return null; }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', color: 'white' }}>
      <h1 style={{ textAlign: 'center', color: '#5865f2' }}>Mis Servidores</h1>
      {error && <p style={{ color: '#ed4245', textAlign: 'center' }}>{error}</p>}
      {servers.length === 0 && !error && (
        <p style={{ textAlign: 'center', color: '#99aab5' }}>No has creado ningún servidor todavía.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.5rem' }}>
        {servers.map(s => (
          <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2c2f33', padding: '1rem', borderRadius: '12px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{s}</span>
            <button
              onClick={() => router.push(`/server/${encodeURIComponent(s)}`)}
              style={{ backgroundColor: '#3ba55c', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1.2rem', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Entrar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
