import { Link } from "react-router";

// logo officiel AIDY (public/logo.png) : cible = trouver le bon client, étoile dans le A = l'IA
export default function Logo({ to = "/today", height = 38 }) {
  return (
    <Link to={to} className="logo" aria-label="AIDY">
      <img src="/logo.png" alt="AIDY" height={height} style={{ height, width: "auto" }} />
    </Link>
  );
}
