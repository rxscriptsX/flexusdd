import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function LogsServerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id: guildId } = router.query as { id: string };

  // Logs
  const [logs, setLogs] = useState<string[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // CPU simulation
  const [cpu, setCpu] = useState(0);
  const cpuRef = useRef<NodeJS.Timeout | null>(null);

  // Storage (usuario actual)
  const [usedStorage, setUsedStorage] = useState(0);
  const [maxStorage, setMaxStorage] = useState(128);
  const freeStorage = maxStorage - usedStorage;

  // Admin panel
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [extraGB, setExtraGB] = useState(0);
  const [adminMsg, setAdminMsg] = useState('');

  // Fetch logs
  const fetchLogs = async () => {
    if (!guildId) return;
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/bot-logs?guildId=${guildId}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error cargando logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Obtener almacenamiento del usuario conectado
  const fetchStorage = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/guild-storage?userId=${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUsedStorage(data.used || 0);
        setMaxStorage(data.max || 128);
      }
    } catch (err) {
      console.error('Error al obtener almacenamiento del usuario:', err);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLogs();
      fetchStorage();
      cpuRef.current = setInterval(() => {
        const newCpu = Math.floor(Math.random() * 10001) / 100; // 0.01 a 100.00
        setCpu(Number(newCpu.toFixed(2)));
      }, 1260);
    }
    return () => {
      if (cpuRef.current) clearInterval(cpuRef.current);
    };
  }, [guildId, status, session]);

  if (status === 'loading') return <p style={{ color: 'white' }}>Cargando sesión...</p>;
  if (!session) {
    router.push('/login');
    return null;
  }

  // Admin modal
  const handleAdminButton = () => {
    const password = prompt('Introduce la contraseña de administrador:');
    if (password === 'onlyalex') {
      setShowAdmin(true);
      setAdminError('');
    } else if (password !== null) {
      setAdminError('Contraseña incorrecta');
    }
  };

  const handleAddStorage = async () => {
    if (!selectedUser.trim()) {
      setAdminMsg('Introduce un ID de usuario válido.');
      return;
    }
    try {
      const res = await fetch('/api/guild-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.trim(), addGB: Number(extraGB) || 0 }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdminMsg(`Añadidos ${extraGB} GB al usuario ${selectedUser}. Ahora su límite es ${data.max} GB.`);
        setSelectedUser('');
        setExtraGB(0);
        // Refrescar almacenamiento del usuario actual por si es el mismo
        fetchStorage();
      } else {
        const err = await res.json();
        setAdminMsg(`Error: ${err.error || 'No se pudo guardar'}`);
      }
    } catch (err) {
      setAdminMsg('Error de conexión.');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', color: 'white', position: 'relative', minHeight: '100vh' }}>
      {/* Cabecera */}
      <div style={styles.header}>
        <h1 style={{ color: '#5865f2', margin: 0 }}>📋 Logs del Bot en este servidor</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href={`/ddservers/${guildId}`} style={styles.backLink}>
            ← Volver a configuración
          </Link>
          <button onClick={() => { fetchLogs(); fetchStorage(); }} style={styles.refreshButton}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Ventanillas simuladas */}
      <div style={styles.panelsGrid}>
        <div style={styles.panel}>
          <div style={styles.panelIcon}>⚙️</div>
          <div style={styles.panelTitle}>CPU</div>
          <div style={styles.panelValue}>{cpu}%</div>
        </div>
        <div style={styles.panel}>
          <div style={styles.panelIcon}>💾</div>
          <div style={styles.panelTitle}>Almacenamiento</div>
          <div style={styles.panelValue}>
            {usedStorage} GB / {maxStorage} GB
          </div>
          <div style={styles.panelSub}>
            Libre: {freeStorage} GB
          </div>
        </div>
      </div>

      {/* Logs */}
      <div style={{ marginTop: '2rem' }}>
        {loadingLogs ? (
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
                  <div key={i} style={styles.logEntry}>{log}</div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Botón "&" escondido */}
      <button
        onClick={handleAdminButton}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid #5865f2',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          color: '#5865f2',
          fontSize: '1.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        title="Administración"
      >
        &amp;
      </button>

      {/* Panel de administración (superpuesto) */}
      {showAdmin && (
        <div style={styles.adminOverlay}>
          <div style={styles.adminPanel}>
            <h2 style={{ color: '#5865f2', marginTop: 0 }}>Panel de Administración</h2>
            <p style={{ color: '#b9bbbe' }}>Añadir almacenamiento a un usuario</p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={styles.label}>ID de usuario de Discord</label>
              <input
                type="text"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                placeholder="123456789012345678"
                style={styles.input}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={styles.label}>GB a añadir</label>
              <input
                type="number"
                value={extraGB}
                onChange={(e) => setExtraGB(Number(e.target.value))}
                min="0"
                step="1"
                style={styles.input}
              />
            </div>
            <button onClick={handleAddStorage} style={styles.saveButton}>
              💾 Guardar
            </button>
            {adminMsg && <p style={{ marginTop: '0.5rem', color: adminMsg.includes('Error') ? '#ed4245' : '#3ba55c' }}>{adminMsg}</p>}
            <button onClick={() => setShowAdmin(false)} style={{ ...styles.saveButton, backgroundColor: '#555', marginTop: '0.5rem' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
      {adminError && <p style={{ color: '#ed4245', textAlign: 'center' }}>{adminError}</p>}
    </div>
  );
}

// Estilos (idénticos a los anteriores)
const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
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
  panelsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  panel: {
    backgroundColor: '#2c2f33',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  panelIcon: {
    fontSize: '2rem',
    marginBottom: '0.3rem',
  },
  panelTitle: {
    fontSize: '0.9rem',
    color: '#99aab5',
    marginBottom: '0.2rem',
  },
  panelValue: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
  },
  panelSub: {
    fontSize: '0.8rem',
    color: '#99aab5',
    marginTop: '0.3rem',
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
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    lineHeight: '1.6',
  },
  logEntry: {
    padding: '0.15rem 0',
    color: '#b9bbbe',
  },
  adminOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  adminPanel: {
    backgroundColor: '#2c2f33',
    borderRadius: '12px',
    padding: '2rem',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
  },
  label: {
    display: 'block',
    marginBottom: '0.3rem',
    fontWeight: 'bold',
    color: '#b9bbbe',
  },
  input: {
    width: '100%',
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid #40444b',
    backgroundColor: '#40444b',
    color: 'white',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  saveButton: {
    backgroundColor: '#5865f2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.8rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem',
    width: '100%',
    marginBottom: '0.5rem',
  },
};
