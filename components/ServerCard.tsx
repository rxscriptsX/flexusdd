import Image from "next/image";
import Link from "next/link";

interface Guild {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
}

export default function ServerCard({ guild }: { guild: Guild }) {
  const iconUrl = guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
    : "/discord-default.png"; // Asegúrate de tener una imagen default en /public

  return (
    <Link href={`/ddservers/${guild.id}`} style={{ textDecoration: "none" }}>
      <div style={styles.card}>
        <div style={styles.iconWrapper}>
          <Image
            src={iconUrl}
            alt={guild.name}
            width={80}
            height={80}
            style={styles.icon}
          />
          {guild.owner && <span style={styles.crown}>👑</span>}
        </div>
        <h3 style={styles.guildName}>{guild.name}</h3>
        <p style={styles.manageText}>⚙️ Administrar</p>
      </div>
    </Link>
  );
}

const styles = {
  card: {
    backgroundColor: "#2c2f33",
    borderRadius: "16px",
    padding: "1.5rem",
    width: "220px",
    textAlign: "center" as const,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    border: "1px solid transparent",
  },
  iconWrapper: {
    position: "relative" as const,
    marginBottom: "1rem",
  },
  icon: {
    borderRadius: "50%",
    backgroundColor: "#40444b",
  },
  crown: {
    position: "absolute" as const,
    top: "-8px",
    right: "-8px",
    fontSize: "1.5rem",
  },
  guildName: {
    color: "#ffffff",
    fontSize: "1.1rem",
    fontWeight: 600,
    margin: "0.5rem 0 0.3rem",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  manageText: {
    color: "#5865f2",
    fontSize: "0.85rem",
    margin: 0,
  },
};
