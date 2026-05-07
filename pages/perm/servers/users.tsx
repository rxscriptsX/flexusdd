import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function CreateServerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [guildId, setGuildId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [cost, setCost] = useState(49); // coste actual
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Login separado
  const [showLogin, setShowLogin] = useState(false);
  const [loginServerName, setLoginServerName] = useState('');

  useEffect(() => {
    if (session?.user?.id) {
      Promise.all([
        fetch(`/api/server-cooldown?userId=${session.user.id}`).then(r => r.json()),
        fetch(`/api/user-server-count`).then(r => r.json())
      ]).then(([cooldownRes, countRes]) => {
        setCooldown(cooldownRes.cooldown || false);
        setCost(countRes.cost || 49);
      });
    }
  }, [session]);

  // Control del temporizador de 30 segundos
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && waitSeconds > 0) {
      interval = setInterval(() => {
        setWaitSeconds(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            performCreate();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, waitSeconds]);

  const performCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/create-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), guildId: guildId.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `Servidor creado (coste: ${data.cost} GB). Redirigiendo...` });
        setTimeout(() => router.push(`/server/${encodeURIComponent(name.trim())}`), 1000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al crear servidor' });
        if (res.status === 429) setCooldown(true);
        // Refrescar coste en caso de error (el contador no se incrementó)
        fetch(`/api/user-server-count`).then(r => r.json()).then(d => setCost(d.cost || 49));
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (name.trim().length < 1 || name.trim().length > 10) {
      setMessage({ type: 'error', text: 'El nombre debe tener entre 1 y 10 caracteres.' });
      return;
    }
    if (!/^\d{17,20}$/.test(guildId.trim())) {
      setMessage({ type: 'error', text: 'ID de servidor de Discord inválido.' });
      return;
    }
    if (cooldown) {
      setMessage({ type: 'error', text: 'Debes esperar 32 horas antes de crear otro servidor.' });
      return;
    }
    // Iniciar cuenta atrás de 30 segundos
    setWaitSeconds(30);
    setTimerActive(true);
    setMessage(null);
  };

  const handleGoToLogin = () => {
    if (loginServerName.trim().length === 0) return;
    router.push(`/server/${encodeURIComponent(loginServerName.trim())}`);
  };

  if (status === 'loading') return <p style={{ color: 'white', textAlign: 'center' }}>Cargando sesión...</p>;
  if (!session) { router.push('/login'); return null; }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', color: 'white' }}>
      <h1 style={{ color: '#5865f2', textAlign: 'center' }}>Crear Servidor</h1>

      {message && (
        <div style={{
          backgroundColor: message.type === 'error' ? 'rgba(237,66,69,0.2)' : 'rgba(59,165,92,0.2)',
          border: `1px solid ${message.type === 'error' ? '#ed4245' : '#3ba55c'}`,
          borderRadius: '8px', padding: '0.8rem', marginBottom: '1.5rem',
          color: message.type === 'error' ? '#ed4245' : '#3ba55c',
        }}>
          {message.text}
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.1rem' }}>
        Coste actual: <strong style={{ color: '#faa61a' }}>{cost} GB</strong>
        <br/><small style={{ color: '#99aab5' }}>El coste se duplica con cada servidor creado.</small>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ fontWeight: 'bold', color: '#b9bbbe' }}>Nombre del servidor (máx. 10 caracteres)</label>
          <input type="text" maxLength={10} value={name} onChange={e => setName(e.target.value)} style={inputStyle} disabled={timerActive || loading} />
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#b9bbbe' }}>ID del servidor de Discord</label>
          <input type="text" value={guildId} onChange={e => setGuildId(e.target.value)} style={inputStyle} disabled={timerActive || loading} />
        </div>
        <button onClick={handleCreate} disabled={timerActive || loading || cooldown}
          style={{
            backgroundColor: timerActive || loading || cooldown ? '#555' : '#3ba55c',
            color: 'white', border: 'none', borderRadius: '8px', padding: '0.8rem',
            fontWeight: 'bold', cursor: timerActive || loading || cooldown ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
          }}>
          {timerActive ? `Espera ${waitSeconds}s...` : loading ? 'Creando...' : cooldown ? 'Espera 32 horas' : `Crear Servidor (${cost} GB)`}
        </button>
      </div>

      {/* Login separado */}
      <div style={{ borderTop: '1px solid #40444b', paddingTop: '1.5rem', textAlign: 'center' }}>
        {!showLogin ? (
          <button onClick={() => setShowLogin(true)}
            style={{ backgroundColor: '#5865f2', color: 'white', border: 'none', borderRadius: '8px', padding: '0.8rem 1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
            🔑 Login en servidor
          </button>
        ) : (
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', color: '#b9bbbe', textAlign: 'left' }}>Nombre del servidor</label>
            <input type="text" value={loginServerName} onChange={e => setLoginServerName(e.target.value)} style={{ ...inputStyle, marginBottom: '0.8rem' }} />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button onClick={handleGoToLogin} style={{ backgroundColor: '#3ba55c', color: 'white', border: 'none', borderRadius: '6px', padding: '0.6rem 1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>
                Ir al login
              </button>
              <button onClick={() => setShowLogin(false)} style={{ backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '6px', padding: '0.6rem 1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem',
  borderRadius: '6px',
  border: '1px solid #40444b',
  backgroundColor: '#40444b',
  color: 'white',
  fontSize: '0.95rem',
  outline: 'none',
  marginTop: '0.3rem',
  boxSizing: 'border-box',
};
