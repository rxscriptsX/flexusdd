import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const packInfo: Record<string, { gb: number; label: string }> = {
  gb50:  { gb: 50,  label: '50 GB' },
  gb128: { gb: 128, label: '128 GB' },
  gb256: { gb: 256, label: '256 GB' },
  gb512: { gb: 512, label: '512 GB' },
  gb1tb: { gb: 1024, label: '1 TB' },
};

export default function RedeemPack() {
  const router = useRouter();
  const { pack } = router.query;
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(false);

  const currentPack = typeof pack === 'string' ? packInfo[pack] : null;

  useEffect(() => {
    if (currentPack && session?.user?.id) {
      checkCooldown();
    }
  }, [currentPack, session]);

  const checkCooldown = async () => {
    if (!currentPack || !session?.user?.id) return;
    try {
      const res = await fetch(`/api/redeem-pack?pack=${pack}&userId=${session.user.id}`);
      const data = await res.json();
      setCooldown(data.cooldown || false);
    } catch {}
  };

  if (status === 'loading') return <p style={{ color: 'white', textAlign: 'center' }}>Cargando sesión...</p>;
  if (!session) {
    router.push('/login');
    return null;
  }

  if (!currentPack) {
    return <p style={{ color: 'white', textAlign: 'center' }}>Pack no válido.</p>;
  }

  const handleRedeem = async () => {
    if (!userId.trim()) {
      setMessage('Introduce tu ID de Dashboard (ID de Discord).');
      return;
    }
    if (cooldown) {
      setMessage(`Debes esperar 30 minutos antes de volver a canjear el pack ${currentPack.label}.`);
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/redeem-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack, userId: userId.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'GB añadidos correctamente.');
        setCooldown(true);
      } else {
        setMessage(data.error || 'Error al canjear.');
        // Si el error no es de cooldown, podríamos volver a verificar
        if (res.status !== 429) checkCooldown();
      }
    } catch {
      setMessage('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', color: 'white' }}>
      <h1 style={{ textAlign: 'center', color: '#5865f2' }}>Canjear {currentPack.label}</h1>
      {message && (
        <div style={{
          backgroundColor: message.includes('Error') || message.includes('esperar') ? 'rgba(237,66,69,0.2)' : 'rgba(59,165,92,0.2)',
          border: `1px solid ${message.includes('Error') || message.includes('esperar') ? '#ed4245' : '#3ba55c'}`,
          borderRadius: '8px',
          padding: '1rem',
          margin: '1rem 0',
          color: message.includes('Error') || message.includes('esperar') ? '#ed4245' : '#3ba55c',
        }}>
          {message}
        </div>
      )}
      <p style={{ textAlign: 'center', color: '#b9bbbe', marginBottom: '2rem' }}>
        Vas a añadir <strong>{currentPack.gb} GB</strong> a la cuenta.
      </p>
      <div style={{ marginBottom: '1rem' }}>
        <label style={styles.label}>ID de Dashboard</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Tu ID de Discord (aparece en la barra superior)"
          style={styles.input}
        />
      </div>
      <button
        onClick={handleRedeem}
        disabled={loading || cooldown}
        style={{
          backgroundColor: '#5865f2',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.8rem',
          fontWeight: 'bold',
          cursor: loading || cooldown ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          width: '100%',
          opacity: loading || cooldown ? 0.6 : 1,
        }}
      >
        {loading ? '⏳ Procesando...' : cooldown ? '⏳ Espera 30 min' : 'Continuar'}
      </button>
    </div>
  );
}

const styles = {
  label: { display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', color: '#b9bbbe' },
  input: {
    width: '100%', padding: '0.6rem', borderRadius: '6px',
    border: '1px solid #40444b', backgroundColor: '#40444b',
    color: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' as const,
  },
};
