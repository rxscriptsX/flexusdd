import Image from "next/image";
import Link from "next/link";

interface Guild {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: number;
}

export default function ServerCard({ guild }: { guild: Guild }) {
  const iconUrl = guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
    : "/default-server-icon.png"; // puedes añadir una imagen por defecto en /public

  return (
    <Link href={`/ddservers/${guild.id}`}>
      <div style={{
        border: "1px solid #ccc",
        borderRadius: "12px",
        padding: "1rem",
        width: "200px",
        cursor: "pointer",
        transition: "transform 0.2s",
        textAlign: "center",
        backgroundColor: "#2c2f33",
        color: "white"
      }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        <Image
          src={iconUrl}
          alt={guild.name}
          width={64}
          height={64}
          style={{ borderRadius: "50%" }}
        />
        <h3 style={{ marginTop: "0.5rem", fontSize: "1rem" }}>{guild.name}</h3>
        {guild.owner && <span style={{ color: "#faa61a" }}>👑 Propietario</span>}
      </div>
    </Link>
  );
}
