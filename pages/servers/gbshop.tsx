import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const products = [
  { gb: 50,  price: '1,99€',  paypal: 'https://www.paypal.com/ncp/payment/YK9FHNXP8X2FJ' },
  { gb: 128, price: '4,99€',  paypal: 'https://www.paypal.com/ncp/payment/M5F7GYP2TZSYC' },
  { gb: 256, price: '9,99€',  paypal: 'https://www.paypal.com/ncp/payment/PDQZF2MY5Q38J' },
  { gb: 512, price: '29,99€', paypal: 'https://www.paypal.com/ncp/payment/W5HXMBWXRYQSE' },
  { gb: 1024, price: '50€',   paypal: 'https://www.paypal.com/ncp/payment/GDHLRUKZMJA4C' },
];

export default function GBShop() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') return <p style={{ color: 'white', textAlign: 'center' }}>Cargando sesión...</p>;
  if (!session) {
    router.push('/login');
    return null;
  }

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
            <a
              href={product.paypal}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...styles.buyButton, textDecoration: 'none', display: 'inline-block' }}
            >
              Comprar
            </a>
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
