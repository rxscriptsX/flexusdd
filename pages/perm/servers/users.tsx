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

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/server-cooldown?userId=${session.user.id}`)
        .then(r => r.json())
        .then(d => setCooldown(d.cooldown || false));
    }
  }, [session]);

  if (status === 'loading') return <p style={{ color: 'white', textAlign: 'center' }}>Cargando sesión...</p>;
  if (!session) { router.push('/login'); return null; }

  const handleCreate = async () => {
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
    setLoading(true);
    try {
      const res = await fetch('/api/create-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), guildId: guildId.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Servidor creado. Redirigiendo...' });
        setTimeout(() => router.push(`/server/${encodeURIComponent(name.trim())}`), 1000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al crear servidor' });
        if (res.status === 429) setCooldown(true);
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión.' });
    } finally {
      setLoading(false);
    }
  };

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field label="Nombre del servidor (máx. 10 caracteres)">
          <input type="text" maxLength={10} value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="ID del servidor de Discord">
          <input type="text" value={guildId} onChange={e => setGuildId(e.target.value)} style={inputStyle} />
        </Field>
        <button onClick={handleCreate} disabled={loading || cooldown}
          style={{
            backgroundColor: loading || cooldown ? '#555' : '#3ba55c',
            color: 'white', border: 'none', borderRadius: '8px', padding: '0.8rem',
            fontWeight: 'bold', cursor: loading || cooldown ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
          }}>
          {loading ? 'Creando...' : cooldown ? 'Espera 32 horas' : 'Crear Servidor (49 GB)'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label style={{ fontWeight: 'bold', color: '#b9bbbe' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.6rem', borderRadius: '6px', border: '1px solid #40444b',
  backgroundColor: '#40444b', color: 'white', fontSize: '0.95rem', outline: 'none',
};
