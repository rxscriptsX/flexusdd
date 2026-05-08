import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function NewsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    fetch('/api/announcements')
      .then(r => r.json())
      .then(data => setAnnouncements(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', color: 'white' }}>
      <h1 style={{ color: '#5865f2', textAlign: 'center' }}>📰 Noticias de FLEXUS</h1>
      {loading && <p style={{ textAlign: 'center' }}>Cargando...</p>}
      {!loading && announcements.length === 0 && (
        <p style={{ textAlign: 'center', color: '#99aab5' }}>No hay anuncios todavía.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
        {announcements.map((a: any) => (
          <div key={a.id} style={{ backgroundColor: '#2c2f33', borderRadius: '16px', padding: '1.5rem', border: '1px solid #40444b' }}>
            <h2 style={{ margin: '0 0 0.5rem' }}>{a.title}</h2>
            {a.imageUrl && (
              <img
                src={a.imageUrl}
                alt={a.title}
                style={{ maxWidth: '100%', borderRadius: '12px', marginBottom: '1rem', maxHeight: '400px', objectFit: 'cover' }}
              />
            )}
            <p style={{ color: '#b9bbbe', whiteSpace: 'pre-wrap' }}>{a.description}</p>
            <small style={{ color: '#72767d' }}>{new Date(a.createdAt).toLocaleString('es-ES')}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
