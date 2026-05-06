import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function RedeemGB() {
  const router = useRouter();
  const { token } = router.query;
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState('');
  const [gb, setGb] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      fetch(`/api/get-token-info?token=${token}`)
        .then(res => res.json())
        .then(data => {
          if (data.gb) {
            setGb(data.gb);
          } else {
            setMessage('Este enlace no es válido o ha caducado.');
          }
        })
        .catch(() => setMessage('Error al verificar el enlace.'));
    }
  }, [token]);

  if (status === 'loading') return <p>Cargando sesión...</p>;
  if (!session) {
    router.push('/login');
    return null;
  }

  const handleRedeem = async () => {
    if (!userId.trim()) {
      setMessage('Introduce tu ID de Dashboard.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/redeem-gb-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userId: userId.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'GB añadidos correctamente.');
      } else {
        setMessage(data.error || 'Error al canjear el enlace.');
      }
    } catch (error) {
      setMessage('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  if (!gb && !message) return <p style={{ color: 'white', textAlign: 'center' }}>Verificando enlace...</p>;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', color: 'white' }}>
      <h1 style={{ textAlign: 'center', color: '#5865f2' }}>Canjear GB</h1>
      {message && (
        <div style={{
          backgroundColor: message.includes('Error') || message.includes('inválido') ? 'rgba(237,66,69,0.2)' : 'rgba(59,165,92,0.2)',
          border: `1px solid ${message.includes('Error') || message.includes('inválido') ? '#ed4245' : '#3ba55c'}`,
          borderRadius: '8px',
          padding: '1rem',
          margin: '1rem 0',
          color: message.includes('Error') || message.includes('inválido') ? '#ed4245' : '#3ba55c',
        }}>
          {message}
        </div>
      )}
      {gb && !message.includes('correctamente') && (
        <>
          <p style={{ textAlign: 'center', color: '#b9bbbe', marginBottom: '2rem' }}>
            Vas a añadir <strong>{gb} GB</strong> a tu cuenta.
          </p>
          <div style={{ marginBottom: '1rem' }}>
            <label style={styles.label}>ID de Dashboard</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Tu ID de usuario de Discord"
              style={styles.input}
            />
            <small style={{ color: '#99aab5' }}>Puedes ver tu ID en la barra superior.</small>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={styles.label}>GB a añadir</label>
            <input
              type="text"
              value={`${gb} GB`}
              disabled
              style={{ ...styles.input, opacity: 0.7, cursor: 'not-allowed' }}
            />
          </div>
          <button
            onClick={handleRedeem}
            disabled={loading}
            style={{
              backgroundColor: '#5865f2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem',
              width: '100%',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '⏳ Procesando...' : 'Continuar'}
          </button>
        </>
      )}
    </div>
  );
}

const styles = {
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
    boxSizing: 'border-box' as const,
  },
};
