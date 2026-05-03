import { useState, useEffect } from "react";

interface SettingsData {
  prefix: string;
  welcomeChannel: string;
  logChannel: string;
  autoRole: string;
  customCommands: { name: string; response: string }[];
  botNickname: string;
}

interface GuildSettingsProps {
  guildId: string;
  guildName: string;
}

export default function GuildSettings({ guildId, guildName }: GuildSettingsProps) {
  const [settings, setSettings] = useState<SettingsData>({
    prefix: "!",
    welcomeChannel: "",
    logChannel: "",
    autoRole: "",
    customCommands: [],
    botNickname: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newCmdName, setNewCmdName] = useState("");
  const [newCmdResponse, setNewCmdResponse] = useState("");

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(`/api/guild-config?guildId=${guildId}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setSettings({
              prefix: data.prefix || "!",
              welcomeChannel: data.welcomeChannel || "",
              logChannel: data.logChannel || "",
              autoRole: data.autoRole || "",
              customCommands: data.customCommands || [],
              botNickname: data.botNickname || "",
            });
          }
        }
      } catch (error) {
        console.error("Error cargando configuración:", error);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [guildId]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId, ...settings }),
      });

      const result = await res.json();

      if (res.ok) {
        setSaveMessage({ type: "success", text: "✅ Configuración guardada y aplicada correctamente." });
      } else {
        setSaveMessage({ type: "error", text: `❌ Error: ${result.error || "No se pudo guardar"}` });
      }
    } catch (error) {
      setSaveMessage({ type: "error", text: "❌ Error de conexión." });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  const addCommand = () => {
    if (newCmdName.trim() && newCmdResponse.trim()) {
      setSettings({
        ...settings,
        customCommands: [...settings.customCommands, { name: newCmdName.trim(), response: newCmdResponse.trim() }],
      });
      setNewCmdName("");
      setNewCmdResponse("");
    }
  };

  const removeCommand = (index: number) => {
    const updated = settings.customCommands.filter((_, i) => i !== index);
    setSettings({ ...settings, customCommands: updated });
  };

  if (loading) return <div style={{ textAlign: "center", color: "white" }}>Cargando configuración...</div>;

  return (
    <div style={{
      backgroundColor: "#2c2f33",
      borderRadius: "12px",
      padding: "2rem",
      maxWidth: "700px",
      margin: "0 auto",
    }}>
      {/* Categoría General */}
      <div style={{ marginBottom: "2rem", borderBottom: "1px solid #40444b", paddingBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#5865f2" }}>⚙️ General</h3>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "bold", color: "#b9bbbe", fontSize: "0.95rem" }}>Prefijo del bot</label>
          <input type="text" value={settings.prefix} onChange={(e) => setSettings({ ...settings, prefix: e.target.value })} style={inputStyle} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "bold", color: "#b9bbbe", fontSize: "0.95rem" }}>Apodo del bot en este servidor</label>
          <input type="text" placeholder="Dejar vacío para no cambiar" value={settings.botNickname} onChange={(e) => setSettings({ ...settings, botNickname: e.target.value })} style={inputStyle} />
          <small style={{ color: "#99aab5" }}>Requiere permiso "Cambiar apodo".</small>
        </div>
      </div>

      {/* Categoría Canales */}
      <div style={{ marginBottom: "2rem", borderBottom: "1px solid #40444b", paddingBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#5865f2" }}>📢 Canales</h3>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "bold", color: "#b9bbbe", fontSize: "0.95rem" }}>Canal de bienvenida (ID)</label>
          <input type="text" value={settings.welcomeChannel} onChange={(e) => setSettings({ ...settings, welcomeChannel: e.target.value })} placeholder="ID del canal" style={inputStyle} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "bold", color: "#b9bbbe", fontSize: "0.95rem" }}>Canal de logs (ID)</label>
          <input type="text" value={settings.logChannel} onChange={(e) => setSettings({ ...settings, logChannel: e.target.value })} placeholder="ID del canal" style={inputStyle} />
        </div>
      </div>

      {/* Categoría Roles */}
      <div style={{ marginBottom: "2rem", borderBottom: "1px solid #40444b", paddingBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#5865f2" }}>🎭 Roles</h3>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "bold", color: "#b9bbbe", fontSize: "0.95rem" }}>Auto-rol al entrar (ID del rol)</label>
          <input type="text" value={settings.autoRole} onChange={(e) => setSettings({ ...settings, autoRole: e.target.value })} placeholder="ID del rol" style={inputStyle} />
        </div>
      </div>

      {/* Categoría Comandos personalizados */}
      <div style={{ marginBottom: "2rem", borderBottom: "1px solid #40444b", paddingBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#5865f2" }}>🔧 Comandos personalizados</h3>
        <p style={{ fontSize: "0.9rem", color: "#99aab5", marginBottom: "0.5rem" }}>
          Añade comandos de texto que el bot responderá automáticamente.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input type="text" placeholder="Nombre (ej: reglas)" value={newCmdName} onChange={(e) => setNewCmdName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <input type="text" placeholder="Respuesta" value={newCmdResponse} onChange={(e) => setNewCmdResponse(e.target.value)} style={{ ...inputStyle, flex: 2 }} />
          <button onClick={addCommand} style={{ backgroundColor: "#3ba55c", color: "white", border: "none", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontWeight: "bold", fontSize: "1.2rem", lineHeight: "1" }}>+</button>
        </div>
        {settings.customCommands.length === 0 && (
          <p style={{ color: "#72767d", fontStyle: "italic" }}>No hay comandos personalizados todavía.</p>
        )}
        {settings.customCommands.map((cmd, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", backgroundColor: "#40444b", padding: "0.5rem", borderRadius: "6px", marginBottom: "0.4rem" }}>
            <span style={{ fontWeight: "bold", marginRight: "0.5rem" }}>{cmd.name}</span>
            <span style={{ color: "#b9bbbe" }}>{cmd.response}</span>
            <button onClick={() => removeCommand(idx)} style={{ marginLeft: "auto", backgroundColor: "transparent", border: "none", color: "#ed4245", cursor: "pointer", fontWeight: "bold", fontSize: "1.1rem" }}>✕</button>
          </div>
        ))}
      </div>

      {/* Botón de guardar */}
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            backgroundColor: "#5865f2",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "0.8rem 2rem",
            fontWeight: "bold",
            fontSize: "1rem",
            width: "100%",
            opacity: saving ? 0.7 : 1,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "⏳ Guardando y aplicando cambios..." : "💾 Guardar configuración"}
        </button>
        {saveMessage && (
          <div style={{
            marginTop: "1rem",
            padding: "0.8rem",
            borderRadius: "8px",
            backgroundColor: saveMessage.type === "success" ? "rgba(59,165,92,0.2)" : "rgba(237,66,69,0.2)",
            color: saveMessage.type === "success" ? "#3ba55c" : "#ed4245",
            fontWeight: "bold",
          }}>
            {saveMessage.text}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem",
  borderRadius: "6px",
  border: "1px solid #40444b",
  backgroundColor: "#40444b",
  color: "white",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
};
