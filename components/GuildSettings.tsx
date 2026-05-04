import { useState, useEffect } from "react";

interface Command {
  name: string;
  response: string;
  category: string;
}

interface SettingsData {
  prefix: string;
  botNickname: string;
  welcomeChannel: string;
  welcomeMessage: string;
  goodbyeChannel: string;
  goodbyeMessage: string;
  logChannel: string;
  autoRole: string;
  levelingEnabled: boolean;
  levelUpChannel: string;
  levelUpMessage: string;
  xpRate: number;
  muteRole: string;
  customCommands: Command[];
}

interface GuildSettingsProps {
  guildId: string;
  guildName: string;
  onConfigSaved: () => void;
}

const CATEGORIES = ["Diversión", "Moderación", "Utilidad", "Música", "Economía", "Niveles", "Sin categoría"];
const MAX_COMMANDS = 200;

export default function GuildSettings({ guildId, guildName, onConfigSaved }: GuildSettingsProps) {
  const [settings, setSettings] = useState<SettingsData>({
    prefix: "!",
    botNickname: "",
    welcomeChannel: "",
    welcomeMessage: "¡Bienvenido {user} al servidor!",
    goodbyeChannel: "",
    goodbyeMessage: "{user} ha salido del servidor.",
    logChannel: "",
    autoRole: "",
    levelingEnabled: false,
    levelUpChannel: "",
    levelUpMessage: "¡{user} ha subido al nivel {level}!",
    xpRate: 10,
    muteRole: "",
    customCommands: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newCmdName, setNewCmdName] = useState("");
  const [newCmdResponse, setNewCmdResponse] = useState("");
  const [newCmdCategory, setNewCmdCategory] = useState("Sin categoría");

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(`/api/guild-config?guildId=${guildId}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setSettings({
              prefix: data.prefix ?? "!",
              botNickname: data.botNickname ?? "",
              welcomeChannel: data.welcomeChannel ?? "",
              welcomeMessage: data.welcomeMessage ?? "¡Bienvenido {user} al servidor!",
              goodbyeChannel: data.goodbyeChannel ?? "",
              goodbyeMessage: data.goodbyeMessage ?? "{user} ha salido del servidor.",
              logChannel: data.logChannel ?? "",
              autoRole: data.autoRole ?? "",
              levelingEnabled: data.levelingEnabled ?? false,
              levelUpChannel: data.levelUpChannel ?? "",
              levelUpMessage: data.levelUpMessage ?? "¡{user} ha subido al nivel {level}!",
              xpRate: data.xpRate ?? 10,
              muteRole: data.muteRole ?? "",
              customCommands: data.customCommands ?? [],
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
    if (settings.customCommands.length > MAX_COMMANDS) {
      setSaveMessage({ type: "error", text: `❌ No puedes tener más de ${MAX_COMMANDS} comandos.` });
      return;
    }

    // Confirmación de gasto de 15 GB
    const confirmed = window.confirm("¿Estás seguro de gastar 15 GB por esta configuración?");
    if (!confirmed) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId,
          guildName,
          guildIcon: null,
          ...settings,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setSaveMessage({ type: "success", text: "✅ Configuración guardada correctamente. Redirigiendo..." });
        setTimeout(() => {
          onConfigSaved();
        }, 1500);
      } else if (res.status === 403) {
        setSaveMessage({ type: "error", text: "❌ Acceso denegado. Has agotado los 128 GB de almacenamiento." });
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
    if (!newCmdName.trim() || !newCmdResponse.trim()) return;
    if (settings.customCommands.length >= MAX_COMMANDS) {
      setSaveMessage({ type: "error", text: `❌ Límite de ${MAX_COMMANDS} comandos alcanzado.` });
      return;
    }
    const newCommand: Command = {
      name: newCmdName.trim(),
      response: newCmdResponse.trim(),
      category: newCmdCategory,
    };
    setSettings({
      ...settings,
      customCommands: [...settings.customCommands, newCommand],
    });
    setNewCmdName("");
    setNewCmdResponse("");
    setNewCmdCategory("Sin categoría");
  };

  const removeCommand = (index: number) => {
    const updated = settings.customCommands.filter((_, i) => i !== index);
    setSettings({ ...settings, customCommands: updated });
  };

  const commandsByCategory: Record<string, Command[]> = {};
  for (const cmd of settings.customCommands) {
    if (!commandsByCategory[cmd.category]) commandsByCategory[cmd.category] = [];
    commandsByCategory[cmd.category].push(cmd);
  }

  if (loading) return <div style={{ textAlign: "center", color: "white" }}>Cargando configuración...</div>;

  return (
    <div style={{ backgroundColor: "#2c2f33", borderRadius: "12px", padding: "2rem", maxWidth: "900px", margin: "0 auto", color: "white" }}>
      {/* General */}
      <Section title="⚙️ General">
        <Field label="Prefijo del bot">
          <input type="text" value={settings.prefix} onChange={(e) => setSettings({ ...settings, prefix: e.target.value })} style={inputStyle} />
        </Field>
        <Field label="Apodo del bot en este servidor">
          <input type="text" placeholder="Dejar vacío para no cambiar" value={settings.botNickname} onChange={(e) => setSettings({ ...settings, botNickname: e.target.value })} style={inputStyle} />
          <small style={{ color: "#99aab5" }}>Requiere permiso "Cambiar apodo".</small>
        </Field>
      </Section>

      {/* Bienvenida / Despedida */}
      <Section title="👋 Bienvenida y Despedida">
        <Field label="Canal de bienvenida (ID)">
          <input type="text" value={settings.welcomeChannel} onChange={(e) => setSettings({ ...settings, welcomeChannel: e.target.value })} placeholder="ID del canal" style={inputStyle} />
        </Field>
        <Field label="Mensaje de bienvenida">
          <textarea value={settings.welcomeMessage} onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })} style={inputStyle} rows={2} />
          <small style={{ color: "#72767d" }}>Variables: {"{user}"}, {"{server}"}, {"{mention}"}</small>
        </Field>
        <Field label="Canal de despedida (ID)">
          <input type="text" value={settings.goodbyeChannel} onChange={(e) => setSettings({ ...settings, goodbyeChannel: e.target.value })} placeholder="ID del canal" style={inputStyle} />
        </Field>
        <Field label="Mensaje de despedida">
          <textarea value={settings.goodbyeMessage} onChange={(e) => setSettings({ ...settings, goodbyeMessage: e.target.value })} style={inputStyle} rows={2} />
        </Field>
      </Section>

      {/* Logs */}
      <Section title="📋 Logs">
        <Field label="Canal de logs (ID)">
          <input type="text" value={settings.logChannel} onChange={(e) => setSettings({ ...settings, logChannel: e.target.value })} placeholder="ID del canal" style={inputStyle} />
        </Field>
      </Section>

      {/* Roles */}
      <Section title="🎭 Roles">
        <Field label="Auto-rol al entrar (ID del rol)">
          <input type="text" value={settings.autoRole} onChange={(e) => setSettings({ ...settings, autoRole: e.target.value })} placeholder="ID del rol" style={inputStyle} />
        </Field>
      </Section>

      {/* Niveles y XP */}
      <Section title="⭐ Niveles y XP">
        <Field label="Habilitar sistema de niveles">
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input type="checkbox" checked={settings.levelingEnabled} onChange={(e) => setSettings({ ...settings, levelingEnabled: e.target.checked })} />
            Activar
          </label>
        </Field>
        {settings.levelingEnabled && (
          <>
            <Field label="Canal de anuncio de subida de nivel (ID)">
              <input type="text" value={settings.levelUpChannel} onChange={(e) => setSettings({ ...settings, levelUpChannel: e.target.value })} placeholder="ID del canal" style={inputStyle} />
            </Field>
            <Field label="Mensaje de subida de nivel">
              <textarea value={settings.levelUpMessage} onChange={(e) => setSettings({ ...settings, levelUpMessage: e.target.value })} style={inputStyle} rows={2} />
              <small style={{ color: "#72767d" }}>Variables: {"{user}"}, {"{level}"}</small>
            </Field>
            <Field label="XP por mensaje (1-100)">
              <input type="number" min={1} max={100} value={settings.xpRate} onChange={(e) => setSettings({ ...settings, xpRate: Number(e.target.value) })} style={inputStyle} />
            </Field>
          </>
        )}
      </Section>

      {/* Moderación */}
      <Section title="🛡️ Moderación">
        <Field label="Rol de mute (ID)">
          <input type="text" value={settings.muteRole} onChange={(e) => setSettings({ ...settings, muteRole: e.target.value })} placeholder="ID del rol" style={inputStyle} />
          <small style={{ color: "#99aab5" }}>El bot asignará este rol al silenciar a un usuario.</small>
        </Field>
      </Section>

      {/* Comandos personalizados */}
      <Section title="🔧 Comandos personalizados">
        <p style={{ fontSize: "0.9rem", color: "#99aab5", marginBottom: "0.5rem" }}>
          Añade hasta {MAX_COMMANDS} comandos de texto. El bot los ejecutará automáticamente si está configurado para leerlos.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <input type="text" placeholder="Nombre (ej: reglas)" value={newCmdName} onChange={(e) => setNewCmdName(e.target.value)} style={{ ...inputStyle, flex: "1 1 150px" }} />
          <input type="text" placeholder="Respuesta" value={newCmdResponse} onChange={(e) => setNewCmdResponse(e.target.value)} style={{ ...inputStyle, flex: "2 1 250px" }} />
          <select value={newCmdCategory} onChange={(e) => setNewCmdCategory(e.target.value)} style={{ ...inputStyle, flex: "1 1 120px" }}>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button onClick={addCommand} style={styles.addBtn}>+</button>
        </div>

        <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #40444b", borderRadius: "8px", padding: "0.5rem", backgroundColor: "#36393f" }}>
          {Object.keys(commandsByCategory).length === 0 && !loading && (
            <p style={{ color: "#72767d", fontStyle: "italic", textAlign: "center" }}>No hay comandos personalizados todavía.</p>
          )}
          {Object.entries(commandsByCategory).map(([category, cmds]) => (
            <div key={category} style={{ marginBottom: "1rem" }}>
              <h4 style={{ margin: "0 0 0.3rem", color: "#5865f2", fontSize: "0.95rem" }}>{category}</h4>
              {cmds.map((cmd, idx) => {
                const actualIndex = settings.customCommands.findIndex(c => c.name === cmd.name && c.response === cmd.response && c.category === cmd.category);
                return (
                  <div key={actualIndex} style={styles.commandItem}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: "bold", marginRight: "0.5rem" }}>{cmd.name}</span>
                      <span style={{ color: "#b9bbbe" }}>{cmd.response}</span>
                    </div>
                    <button onClick={() => removeCommand(actualIndex)} style={styles.removeBtn}>✕</button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <small style={{ color: "#99aab5" }}>Total: {settings.customCommands.length}/{MAX_COMMANDS}</small>
      </Section>

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

// Componentes auxiliares
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2rem", borderBottom: "1px solid #40444b", paddingBottom: "1.5rem" }}>
      <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#5865f2" }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.2rem" }}>
      <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "bold", color: "#b9bbbe", fontSize: "0.95rem" }}>{label}</label>
      {children}
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

const styles = {
  addBtn: {
    backgroundColor: "#3ba55c",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "0.4rem 0.8rem",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1.2rem",
    lineHeight: "1",
  },
  commandItem: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#40444b",
    padding: "0.4rem 0.6rem",
    borderRadius: "4px",
    marginBottom: "0.3rem",
  },
  removeBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "#ed4245",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1.1rem",
    marginLeft: "0.5rem",
  },
};
