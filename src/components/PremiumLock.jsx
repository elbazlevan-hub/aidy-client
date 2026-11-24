import { Link } from "react-router";
import { useI18n } from "../i18n/I18nContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export const hasPremium = (user) => user?.plan === "premium" || user?.role === "admin";

// encart « réservé au Premium » : montre ce que la fonction apporte + bouton pour débloquer
export default function PremiumLock({ text }) {
  const { t } = useI18n();
  return (
    <div className="premium-lock">
      <span className="premium-lock-icon" aria-hidden="true">🔒</span>
      <p className="small">{text}</p>
      <Link className="btn btn-premium btn-small" to="/packs">★ {t("premium.cta")}</Link>
    </div>
  );
}

// affiche le contenu Premium, ou l'encart bloqué pour les autres
export function PremiumOnly({ text, children }) {
  const { user } = useAuth();
  return hasPremium(user) ? children : <PremiumLock text={text} />;
}
