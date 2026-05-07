import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';

export default function CreateServerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [guildId, setGuildId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [cost, setCost] = useState(49);
  const [creating, setCreating] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginServerName, setLoginServerName] = useState('');

  // Cargar cooldown y coste
  const loadData = async () => {
    if (!session?.user?.id) return;
    const [cooldownRes, countRes] = await Promise.all([
      fetch(`/api/server-cooldown?userId=${session.user.id}`).then(r => r.json()),
      fetch(`/api/user-server-count`).then(r => r.json())
    ]);
    setCooldown(cooldownRes.cooldown || false);
    setCooldownRemaining(cooldownRes.remaining || 0);
    setCost(countRes.cost || 49);
  };

  useEffect(() => {
    if (status === 'authenticated') {
      loadData();
    }
  }, [status, session]);

  // Actualizar el contador de cooldown cada segundo
  useEffect(() => {
    if (!cooldown) return;
    const interval = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev <= 1) {
          setCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Limpiar temporizador de creación al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
        if (res.status === 429) {
          // Actualizar cooldown desde la API
          loadData();
        } else {
          // Refrescar coste por si cambió
          fetch(`/api/user-server-count`).then(r => r.json()).then(d => setCost(d.cost || 49));
        }
        setCreating(false);
        setLoading(false);
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión. Revisa la consola (F12) para más detalles.' });
      setCreating(false);
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
      setMessage({ type: 'error', text: `Debes esperar ${cooldownRemaining} segundos.` });
      return;
    }
    setMessage(null);
    setCreating(true);
    setCountdown(5);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCreating(false);
          performCreate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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

      {cooldown && (
        <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#fbbf24' }}>
          ⏳ Debes esperar {cooldownRemaining} segundos antes de crear otro servidor.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ fontWeight: 'bold', color: '#b9bbbe' }}>Nombre del servidor (máx. 10 caracteres)</label>
          <input
            type="text"
            maxLength={10}
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
            disabled={creating || loading || cooldown}
          />
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#b9bbbe' }}>ID del servidor de Discord</label>
          <input
            type="text"
            value={guildId}
            onChange={e => setGuildId(e.target.value)}
            style={inputStyle}
            disabled={creating || loading || cooldown}
          />
        </div>
        <button
          onClick={handleCreate}
          disabled={creating || loading || cooldown}
          style={{
            backgroundColor: (creating || loading || cooldown) ? '#555' : '#3ba55c',
            color: 'white', border: 'none', borderRadius: '8px', padding: '0.8rem',
            fontWeight: 'bold', cursor: (creating || loading || cooldown) ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
          }}
        >
          {creating ? `Espera ${countdown}s...` : loading ? 'Creando...' : cooldown ? `Espera ${cooldownRemaining}s` : `Crear Servidor (${cost} GB)`}
        </button>
      </div>

      {/* Login en servidor */}
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
