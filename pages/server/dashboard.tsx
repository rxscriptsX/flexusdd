import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function ServerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [servers, setServers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchServers = async () => {
    if (!userId.trim()) {
      setError('Introduce tu ID de Dashboard.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/user-servers?userId=${userId.trim()}`);
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

  if (status === 'loading') return <p style={{ color: 'white', textAlign: 'center' }}>Cargando sesión...</p>;
  if (!session) { router.push('/login'); return null; }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', color: 'white' }}>
      <h1 style={{ textAlign: 'center', color: '#5865f2' }}>Servers Dashboard</h1>
      <p style={{ textAlign: 'center', color: '#99aab5' }}>Introduce tu ID de Dashboard (ID de Discord) para ver tus servidores.</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', marginTop: '1.5rem' }}>
        <input
          type="text"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          placeholder="Tu ID de Discord (ej. 123456789012345678)"
          style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #40444b', backgroundColor: '#40444b', color: 'white', fontSize: '1rem' }}
        />
        <button
          onClick={fetchServers}
          disabled={loading}
          style={{ padding: '0.8rem 1.5rem', backgroundColor: '#5865f2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      {error && <p style={{ color: '#ed4245', textAlign: 'center' }}>{error}</p>}
      {servers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
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
      )}
    </div>
  );
}
