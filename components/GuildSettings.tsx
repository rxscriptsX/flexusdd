import { useState } from "react";

interface GuildSettingsProps {
  guildId: string;
}

export default function GuildSettings({ guildId }: GuildSettingsProps) {
  const [prefix, setPrefix] = useState("!");
  const [welcomeChannel, setWelcomeChannel] = useState("");
  const [logChannel, setLogChannel] = useState("");
  const [autoRole, setAutoRole] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    // Aquí después conectarás con tu bot o base de datos
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ borderBottom: "2px solid #5865f2", paddingBottom: "0.5rem" }}>
        ⚙️ Configuración del servidor
      </h2>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "bold" }}>Prefijo del bot</label>
        <input
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          style={{ padding: "0.5rem", width: "100%", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "#2c2f33", color: "white" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "bold" }}>Canal de bienvenida (ID)</label>
        <input
          type="text"
          value={welcomeChannel}
          onChange={(e) => setWelcomeChannel(e.target.value)}
          placeholder="Ej: 123456789012345678"
          style={{ padding: "0.5rem", width: "100%", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "#2c2f33", color: "white" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "bold" }}>Canal de logs (ID)</label>
        <input
          type="text"
          value={logChannel}
          onChange={(e) => setLogChannel(e.target.value)}
          placeholder="Ej: 123456789012345678"
          style={{ padding: "0.5rem", width: "100%", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "#2c2f33", color: "white" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "bold" }}>Auto-rol (ID del rol)</label>
        <input
          type="text"
          value={autoRole}
          onChange={(e) => setAutoRole(e.target.value)}
          placeholder="Ej: 987654321098765432"
          style={{ padding: "0.5rem", width: "100%", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "#2c2f33", color: "white" }}
        />
      </div>

      <button
        onClick={handleSave}
        style={{
          backgroundColor: "#5865f2",
          color: "white",
          padding: "0.7rem 1.5rem",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
          marginTop: "0.5rem"
        }}
      >
        {saved ? "✅ Guardado" : "💾 Guardar configuración"}
      </button>
    </div>
  );
}
