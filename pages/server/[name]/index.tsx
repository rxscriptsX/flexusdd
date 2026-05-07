import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ServerPanel() {
  const router = useRouter();
  const { name } = router.query;
  const { data: session, status } = useSession();
  const [server, setServer] = useState<any>(null);
  const [authenticated, setAuthenticated] = useState(false); // login local
  const [loginName, setLoginName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMsg, setLoginMsg] = useState('');
  const [tab, setTab] = useState<'console' | 'users' | 'commands' | 'settings'>('console');

  // Para consola simulada
  const [cpu, setCpu] = useState(0);
  const [mem, setMem] = useState(0);
  const [net, setNet] = useState(0);

  const loadServer = async () => {
    if (!name) return;
    try {
      const res = await fetch(`/api/server-data?name=${encodeURIComponent(name as string)}`);
      const data = await res.json();
      setServer(data.server || null);
    } catch {}
  };

  useEffect(() => { loadServer(); }, [name]);

  // Simular CPU (cada 1.26s), Mem (cada 2.1s), Net (cada 3.5s)
  useEffect(() => {
    if (!authenticated) return;
    const cpuInterval = setInterval(() => setCpu(Math.floor(Math.random() * 10001)/100), 1260);
    const memInterval = setInterval(() => setMem(Math.floor(Math.random() * 8000)/100), 2100);
    const netInterval = setInterval(() => setNet(Math.floor(Math.random() * 5000)/100), 3500);
    return () => { clearInterval(cpuInterval); clearInterval(memInterval); clearInterval(netInterval); };
  }, [authenticated]);

  if (status === 'loading') return <p style={{ color: 'white' }}>Cargando sesión...</p>;
  if (!session) { router.push('/login'); return null; }

  if (!server) return <p style={{ color: 'white', textAlign: 'center' }}>Servidor no encontrado.</p>;

  // Login local
  if (!authenticated) {
    const handleLogin = () => {
      if (loginName !== name || loginId !== (server.guildId || '') || loginPassword !== server.password) {
        setLoginMsg('Credenciales incorrectas.');
        return;
      }
      setAuthenticated(true);
    };
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', color: 'white' }}>
        <h2 style={{ color: '#5865f2' }}>Login en {name}</h2>
        <Field label="Nombre del servidor"><input value={loginName} onChange={e => setLoginName(e.target.value)} style={inputStyle} /></Field>
        <Field label="ID del servidor"><input value={loginId} onChange={e => setLoginId(e.target.value)} style={inputStyle} /></Field>
        <Field label="Contraseña"><input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} style={inputStyle} /></Field>
        <button onClick={handleLogin} style={{ ...styles.primaryBtn, marginTop: '1rem' }}>Login</button>
        {loginMsg && <p style={{ color: '#ed4245', marginTop: '0.5rem' }}>{loginMsg}</p>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', color: 'white' }}>
      <h1 style={{ color: '#5865f2' }}>{name}</h1>
      {/* Pestañas */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {(['console','users','commands','settings'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ ...styles.tab, backgroundColor: tab === t ? '#5865f2' : '#2c2f33' }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tab === 'console' && (
        <div>
          <h3>Consola</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
            <Card title="CPU" value={`${cpu}%`} />
            <Card title="Memory" value={`${mem} MiB`} />
            <Card title="Network" value={`${net} KiB/s`} />
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div>
          <h3>Usuarios con acceso</h3>
          <UserManager serverName={name as string} />
        </div>
      )}

      {tab === 'commands' && (
        <div>
          <h3>Comandos personalizados (más de 121 disponibles)</h3>
          <CommandsSection serverName={name as string} />
        </div>
      )}

      {tab === 'settings' && (
        <div>
          <h3>Ajustes del servidor</h3>
          <pre style={{ backgroundColor: '#2c2f33', padding: '1rem', borderRadius: '8px' }}>
            {JSON.stringify(server, null, 2)}
          </pre>
          <p style={{ color: '#99aab5' }}>Contraseña: {server.password}</p>
        </div>
      )}
    </div>
  );
}

// Subcomponentes (definir dentro del mismo archivo o importarlos)
function Card({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ backgroundColor: '#2c2f33', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '0.9rem', color: '#99aab5' }}>{title}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
    </div>
  );
}

function UserManager({ serverName }: { serverName: string }) {
  const [users, setUsers] = useState<string[]>([]);
  const [newUserId, setNewUserId] = useState('');
  const [msg, setMsg] = useState('');

  const loadUsers = async () => {
    const res = await fetch(`/api/server-users?name=${encodeURIComponent(serverName)}`);
    const d = await res.json();
    setUsers(d.users || []);
  };
  useEffect(() => { loadUsers(); }, []);

  const addUser = async () => {
    const res = await fetch('/api/add-server-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: serverName, userId: newUserId.trim() }),
    });
    const d = await res.json();
    if (res.ok) { setMsg('Usuario añadido.'); setNewUserId(''); loadUsers(); }
    else setMsg(d.error || 'Error');
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input placeholder="ID de usuario" value={newUserId} onChange={e => setNewUserId(e.target.value)} style={inputStyle} />
        <button onClick={addUser} style={styles.primaryBtn}>Añadir</button>
      </div>
      {msg && <p style={{ color: msg.includes('Error') ? '#ed4245' : '#3ba55c' }}>{msg}</p>}
      <ul>{users.map(u => <li key={u}>{u}</li>)}</ul>
    </div>
  );
}

function CommandsSection({ serverName }: { serverName: string }) {
  const [commands, setCommands] = useState<{ name: string; response: string }[]>([]);
  const [newName, setNewName] = useState('');
  const [newResp, setNewResp] = useState('');

  const load = async () => {
    const res = await fetch(`/api/server-commands?name=${encodeURIComponent(serverName)}`);
    const d = await res.json();
    setCommands(d.commands || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    await fetch('/api/add-server-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: serverName, cmdName: newName, response: newResp }),
    });
    setNewName(''); setNewResp('');
    load();
  };

  const remove = async (cmdName: string) => {
    await fetch('/api/remove-server-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: serverName, cmdName }),
    });
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input placeholder="Nombre comando" value={newName} onChange={e => setNewName(e.target.value)} style={inputStyle} />
        <input placeholder="Respuesta" value={newResp} onChange={e => setNewResp(e.target.value)} style={inputStyle} />
        <button onClick={add} style={styles.primaryBtn}>+</button>
      </div>
      {commands.length === 0 && <p>No hay comandos. Añade el primero.</p>}
      {commands.map(c => (
        <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#2c2f33', padding: '0.3rem 0.6rem', borderRadius: '4px', marginBottom: '0.3rem' }}>
          <span><strong>{c.name}</strong>: {c.response}</span>
          <button onClick={() => remove(c.name)} style={{ background: 'none', border: 'none', color: '#ed4245', cursor: 'pointer' }}>✕</button>
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontWeight: 'bold', color: '#b9bbbe', marginBottom: '0.3rem' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.6rem', borderRadius: '6px', border: '1px solid #40444b',
  backgroundColor: '#40444b', color: 'white', fontSize: '0.95rem', outline: 'none', flex: 1,
};

const styles = {
  primaryBtn: {
    backgroundColor: '#5865f2', color: 'white', border: 'none',
    borderRadius: '6px', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer',
  },
  tab: {
    border: 'none', borderRadius: '6px', padding: '0.5rem 1rem',
    fontWeight: 'bold', cursor: 'pointer', color: 'white',
  },
};
