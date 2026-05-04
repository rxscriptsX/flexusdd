import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function LogsServerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id: guildId } = router.query as { id: string };

  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if (!guildId) return;
    setLoading(true);
    try {
      // Llamada directa a la API que almacena los logs
      const res = await fetch(`/api/bot-logs?guildId=${guildId}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error cargando logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLogs();
    }
  }, [guildId, status]);

  if (status === 'loading') return <p style={{ color: 'white' }}>Cargando sesión...</p>;
  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', color: 'white' }}>
      <div style={styles.header}>
        <h1 style={{ color: '#5865f2', margin: 0 }}>📋 Logs del Bot en este servidor</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href={`/ddservers/${guildId}`} style={styles.backLink}>
            ← Volver a configuración
          </Link>
          <button onClick={fetchLogs} style={styles.refreshButton}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#99aab5' }}>Cargando logs...</p>
      ) : (
        <div style={styles.logContainer}>
          <div style={styles.logBox}>
            {logs.length === 0 ? (
              <p style={{ color: '#72767d', fontStyle: 'italic' }}>
                No hay logs recientes. Ejecuta un comando slash y vuelve a actualizar.
              </p>
            ) : (
              logs.map((log, i) => (
                <div key={i} style={styles.logEntry}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  backLink: {
    color: '#99aab5',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  refreshButton: {
    background: 'none',
    border: '1px solid #5865f2',
    color: '#5865f2',
    borderRadius: '4px',
    padding: '0.3rem 0.8rem',
    cursor: 'pointer',
  },
  logContainer: {
    backgroundColor: '#2c2f33',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  logBox: {
    backgroundColor: '#1e2124',
    borderRadius: '8px',
    padding: '1rem',
    maxHeight: '500px',
    overflowY: 'auto' as const,
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    lineHeight: '1.6',
  },
  logEntry: {
    padding: '0.15rem 0',
    color: '#b9bbbe',
  },
};
