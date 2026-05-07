import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// ========== LISTA DE 121 COMANDOS PREDEFINIDOS ==========
const PREDEFINED_COMMANDS = [
  'ban', 'kick', 'mute', 'unmute', 'warn', 'clear', 'lock', 'unlock',
  'slowmode', 'announce', 'giveaway', 'poll', 'role', 'nickname',
  'avatar', 'userinfo', 'serverinfo', 'botinfo', 'ping', 'uptime',
  'stats', 'invite', 'help', 'setup', 'prefix', 'config', 'settings',
  'logs', 'welcome', 'goodbye', 'autorole', 'level', 'rank', 'xp',
  'mylevel', 'leaderboard', 'profile', 'balance', 'daily', 'work',
  'shop', 'buy', 'sell', 'inventory', 'transfer', 'pay', 'rob',
  'cryto', 'price', 'stock', 'weather', 'time', 'remind', 'todo',
  'note', 'translate', 'define', 'wikipedia', 'urban', 'trivia',
  'quiz', 'roll', 'dice', '8ball', 'flip', 'coin', 'slots', 'blackjack',
  'mines', 'rockpaperscissors', 'hangman', 'tictactoe', 'chess',
  'connect4', 'battleship', 'wordle', 'meme', 'image', 'cat', 'dog',
  'fox', 'bird', 'panda', 'koala', 'redpanda', 'quote', 'joke',
  'fact', 'advice', 'idea', 'challenge', 'truthordare', 'neverhaveiever',
  'story', 'madlibs', 'ascii', 'secret', 'hug', 'kiss', 'slap', 'pat',
  'cuddle', 'dance', 'sing', 'music', 'play', 'stop', 'skip', 'queue',
  'lyrics', 'reactionroles', 'ticket', 'close', 'delete', 'edit',
  'embed', 'say', 'echo', 'purge', 'raidmode', 'antispam', 'antilink',
  'antiscam', 'filter', 'wordblock', 'unblock'
];

// ========== ESTILOS GLOBALES (CSS-in-JS) ==========
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    backgroundSize: '400% 400%',
    animation: 'gradient 15s ease infinite',
    padding: '2rem',
    color: 'white',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  } as React.CSSProperties,
  title: {
    fontSize: '2.2rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as React.CSSProperties,
  logoutBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '0.6rem 1.4rem',
    cursor: 'pointer',
    fontWeight: 600,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s',
  } as React.CSSProperties,
  tabBar: {
    display: 'flex',
    gap: '0.8rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  } as React.CSSProperties,
  tab: (active: boolean) => ({
    padding: '0.7rem 1.6rem',
    borderRadius: '14px',
    border: 'none',
    fontWeight: 700,
    cursor: 'pointer',
    background: active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.06)',
    color: 'white',
    boxShadow: active ? '0 8px 20px rgba(102, 126, 234, 0.4)' : 'none',
    backdropFilter: active ? 'blur(6px)' : 'none',
    transition: 'all 0.25s',
    fontSize: '1rem',
  }),
  panel: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(12px)',
    borderRadius: '24px',
    padding: '2rem',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    minHeight: '400px',
  },
  consoleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  card: {
    background: 'rgba(255,255,255,0.07)',
    borderRadius: '20px',
    padding: '1.8rem',
    textAlign: 'center' as const,
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  metricTitle: { fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#a0aec0' },
  metricValue: { fontSize: '2.2rem', fontWeight: 700, marginTop: '0.4rem' },
  input: {
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    backdropFilter: 'blur(4px)',
    marginTop: '0.4rem',
  },
  commandList: {
    maxHeight: '500px',
    overflowY: 'auto' as const,
    paddingRight: '0.5rem',
    marginTop: '1.5rem',
  },
  commandItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.7rem 1rem',
    marginBottom: '0.5rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
    transition: 'background 0.2s',
  },
  toggle: (enabled: boolean) => ({
    width: '50px',
    height: '28px',
    borderRadius: '28px',
    background: enabled ? 'linear-gradient(135deg, #48bb78, #38a169)' : 'rgba(255,255,255,0.15)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    transition: 'all 0.3s',
  }),
  toggleKnob: (enabled: boolean) => ({
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'white',
    transform: enabled ? 'translateX(22px)' : 'translateX(0)',
    transition: 'transform 0.3s',
  }),
  settingsBox: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '14px',
    padding: '1.5rem',
    fontFamily: 'monospace',
    fontSize: '0.95rem',
    overflowX: 'auto' as const,
  },
  passwordDisplay: {
    background: 'rgba(0,0,0,0.3)',
    padding: '0.8rem',
    borderRadius: '10px',
    wordBreak: 'break-all' as const,
    marginTop: '1rem',
  },
};

// ========== COMPONENTE PRINCIPAL ==========
export default function ServerPanel() {
  const router = useRouter();
  const { name } = router.query;
  const { data: session, status } = useSession();

  const [server, setServer] = useState<any>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<'console' | 'users' | 'commands' | 'settings'>('console');

  // Recursos simulados
  const [cpu, setCpu] = useState(0);
  const [mem, setMem] = useState(0);
  const [net, setNet] = useState(0);

  // Comandos predefinidos (KV guarda un objeto { [cmdName]: boolean })
  const [predefinedCmds, setPredefinedCmds] = useState<Record<string, boolean>>({});
  const [customCmds, setCustomCmds] = useState<{ name: string; response: string }[]>([]);

  // Usuarios
  const [users, setUsers] = useState<string[]>([]);
  const [newUser, setNewUser] = useState('');

  // Cargar datos del servidor
  const loadServer = async () => {
    if (!name) return;
    try {
      const res = await fetch(`/api/server-data?name=${encodeURIComponent(name as string)}`);
      const data = await res.json();
      setServer(data.server || null);
    } catch {}
  };

  // Cargar comandos
  const loadCommands = async () => {
    if (!name) return;
    try {
      const res = await fetch(`/api/server-commands?name=${encodeURIComponent(name as string)}`);
      const data = await res.json();
      setPredefinedCmds(data.commands || {});
    } catch {}
  };

  // Cargar comandos personalizados
  const loadCustomCmds = async () => {
    if (!name) return;
    try {
      const res = await fetch(`/api/server-custom-commands?name=${encodeURIComponent(name as string)}`);
      const data = await res.json();
      setCustomCmds(data.commands || []);
    } catch {}
  };

  // Cargar usuarios
  const loadUsers = async () => {
    if (!name) return;
    try {
      const res = await fetch(`/api/server-users?name=${encodeURIComponent(name as string)}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch {}
  };

  useEffect(() => { loadServer(); }, [name]);

  useEffect(() => {
    if (server && session?.user?.id === server.owner) {
      setAuthenticated(true);
    }
  }, [server, session]);

  useEffect(() => {
    if (authenticated) {
      loadCommands();
      loadCustomCmds();
      loadUsers();
      // Simular consola
      const cpuInt = setInterval(() => setCpu(+(Math.random() * 100).toFixed(1)), 1260);
      const memInt = setInterval(() => setMem(+(Math.random() * 8).toFixed(2)), 2100);
      const netInt = setInterval(() => setNet(+(Math.random() * 100).toFixed(1)), 3500);
      return () => { clearInterval(cpuInt); clearInterval(memInt); clearInterval(netInt); };
    }
  }, [authenticated]);

  if (status === 'loading') return <p style={{ color: 'white', textAlign: 'center' }}>Cargando sesión...</p>;
  if (!session) { router.push('/login'); return null; }
  if (!server) return <p style={{ color: 'white', textAlign: 'center' }}>Servidor no encontrado.</p>;

  // Login (solo contraseña)
  if (!authenticated) {
    const handleLogin = () => {
      if (password === server.password) {
        setAuthenticated(true);
        setLoginError('');
      } else {
        setLoginError('Contraseña incorrecta.');
      }
    };

    return (
      <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', borderRadius: '28px', padding: '3rem', maxWidth: '420px', width: '100%', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem' }}>
            {name}
          </h1>
          <p style={{ textAlign: 'center', color: '#a0aec0', marginBottom: '2rem' }}>Introduce la contraseña secreta</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña de 72 dígitos"
            style={styles.input}
          />
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              marginTop: '1.5rem',
              padding: '0.9rem',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
          >
            Acceder
          </button>
          {loginError && <p style={{ color: '#fc8181', marginTop: '1rem', textAlign: 'center' }}>{loginError}</p>}
        </div>
      </div>
    );
  }

  // --- Funciones para comandos ---
  const toggleCommand = async (cmdName: string, enabled: boolean) => {
    const newCmds = { ...predefinedCmds, [cmdName]: enabled };
    setPredefinedCmds(newCmds);
    await fetch('/api/toggle-server-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, cmdName, enabled }),
    });
  };

  const addCustomCommand = async () => {
    const cmdName = (document.getElementById('newCmdName') as HTMLInputElement)?.value;
    const response = (document.getElementById('newCmdResponse') as HTMLInputElement)?.value;
    if (!cmdName || !response) return;
    await fetch('/api/add-server-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, cmdName, response }),
    });
    loadCustomCmds();
    (document.getElementById('newCmdName') as HTMLInputElement).value = '';
    (document.getElementById('newCmdResponse') as HTMLInputElement).value = '';
  };

  const removeCustomCommand = async (cmdName: string) => {
    await fetch('/api/remove-server-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, cmdName }),
    });
    loadCustomCmds();
  };

  const addUser = async () => {
    if (!newUser.trim()) return;
    await fetch('/api/add-server-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, userId: newUser.trim() }),
    });
    setNewUser('');
    loadUsers();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{name}</h1>
        <button style={styles.logoutBtn} onClick={() => router.push('/dashboard')}>
          ← Volver al Dashboard
        </button>
      </div>

      <div style={styles.tabBar}>
        {(['console', 'users', 'commands', 'settings'] as const).map(t => (
          <button key={t} style={styles.tab(tab === t)} onClick={() => setTab(t)}>
            {t === 'console' ? '🖥️ Consola' : t === 'users' ? '👥 Usuarios' : t === 'commands' ? '⚡ Comandos' : '⚙️ Ajustes'}
          </button>
        ))}
      </div>

      <div style={styles.panel}>
        {tab === 'console' && (
          <div>
            <div style={styles.consoleGrid}>
              <div style={styles.card}>
                <div style={styles.metricTitle}>CPU</div>
                <div style={styles.metricValue}>{cpu}%</div>
              </div>
              <div style={styles.card}>
                <div style={styles.metricTitle}>Memoria</div>
                <div style={styles.metricValue}>{mem} GiB</div>
              </div>
              <div style={styles.card}>
                <div style={styles.metricTitle}>Red</div>
                <div style={styles.metricValue}>{net} Mbps</div>
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div>
            <h3 style={{ marginBottom: '1.5rem' }}>Gestión de acceso</h3>
            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem' }}>
              <input
                placeholder="ID de Discord del usuario"
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
                style={{ ...styles.input, flex: 1 }}
              />
              <button onClick={addUser} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                Añadir
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
              {users.map(u => (
                <span key={u} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                  {u}
                </span>
              ))}
            </div>
          </div>
        )}

        {tab === 'commands' && (
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Comandos predefinidos ({Object.keys(predefinedCmds).filter(k => predefinedCmds[k]).length} activos)</h3>
            <div style={styles.commandList}>
              {PREDEFINED_COMMANDS.map(cmd => (
                <div key={cmd} style={styles.commandItem}>
                  <span style={{ fontWeight: 600 }}>{cmd}</span>
                  <div
                    style={styles.toggle(!!predefinedCmds[cmd])}
                    onClick={() => toggleCommand(cmd, !predefinedCmds[cmd])}
                  >
                    <div style={styles.toggleKnob(!!predefinedCmds[cmd])} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Comandos personalizados</h3>
              <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem' }}>
                <input id="newCmdName" placeholder="Nombre" style={{ ...styles.input, flex: 1 }} />
                <input id="newCmdResponse" placeholder="Respuesta" style={{ ...styles.input, flex: 2 }} />
                <button onClick={addCustomCommand} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                  +
                </button>
              </div>
              {customCmds.map(cmd => (
                <div key={cmd.name} style={{ ...styles.commandItem, justifyContent: 'space-between' }}>
                  <span><strong>{cmd.name}</strong>: {cmd.response}</span>
                  <button onClick={() => removeCustomCommand(cmd.name)} style={{ background: 'none', border: 'none', color: '#fc8181', cursor: 'pointer', fontSize: '1.2rem' }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div>
            <h3 style={{ marginBottom: '1.5rem' }}>Detalles del servidor</h3>
            <div style={styles.settingsBox}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify({ owner: server.owner, guildId: server.guildId, users: server.users }, null, 2)}
              </pre>
            </div>
            <div style={styles.passwordDisplay}>
              <span style={{ color: '#a0aec0' }}>Contraseña secreta: </span>
              <code style={{ color: '#fbbf24', fontWeight: 600 }}>{server.password}</code>
              <p style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.5rem' }}>
                Solo visible aquí. Guárdala para acceder en el futuro.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Animación del fondo */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
