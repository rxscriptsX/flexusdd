import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

const products = [
  { gb: 50, price: '1,99€' },
  { gb: 128, price: '4,99€' },
  { gb: 256, price: '9,99€' },
  { gb: 512, price: '29,99€' },
  { gb: 1024, price: '50€' },
];

export default function GBShop() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  if (status === 'loading') return <p>Cargando...</p>;
  if (!session) {
    router.push('/login');
    return null;
  }

  const handleBuy = async (gb: number) => {
    setLoading(`buying-${gb}`);
    try {
      const res = await fetch('/api/generate-gb-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gb }),
      });
      const data = await res.json();
      if (data.token) {
        router.push(`/servers/shop/${data.token}`);
      } else {
        alert('Error generando enlace');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', color: 'white' }}>
      <h1 style={{ textAlign: 'center', color: '#5865f2' }}>Tienda de GB</h1>
      <p style={{ textAlign: 'center', color: '#99aab5' }}>
        Compra almacenamiento extra para tu cuenta del Dashboard.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem' }}>
        {products.map((product) => (
          <div key={product.gb} style={styles.card}>
            <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{product.gb} GB</h2>
            <p style={{ fontSize: '1.5rem', color: '#5865f2', fontWeight: 'bold' }}>{product.price}</p>
            <button
              onClick={() => handleBuy(product.gb)}
              disabled={loading === `buying-${product.gb}`}
              style={{
                ...styles.buyButton,
                opacity: loading === `buying-${product.gb}` ? 0.7 : 1,
              }}
            >
              {loading === `buying-${product.gb}` ? 'Generando...' : 'Comprar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#2c2f33',
    borderRadius: '16px',
    padding: '2rem',
    textAlign: 'center' as const,
    width: '200px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
  buyButton: {
    marginTop: '1rem',
    backgroundColor: '#faa61a',
    color: 'black',
    border: 'none',
    borderRadius: '8px',
    padding: '0.7rem 1.5rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem',
    width: '100%',
  },
};
