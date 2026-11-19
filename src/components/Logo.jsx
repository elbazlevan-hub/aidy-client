import { Link } from "react-router";

// le mot AIDY (l'étoile dans le A = l'IA) ; l'icône seule sert pour l'onglet et l'écran d'accueil du téléphone
export default function Logo({ to = "/today", height = 26 }) {
  return (
    <Link to={to} className="logo" aria-label="AIDY">
      <img src="/aidy-wordmark.png" alt="AIDY" height={height} style={{ height, width: "auto" }} />
    </Link>
  );
}
