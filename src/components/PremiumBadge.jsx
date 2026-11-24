import { useI18n } from "../i18n/I18nContext.jsx";

// petite étiquette « Premium » à côté des fonctions réservées au pack Premium (visible par tout le monde)
export default function PremiumBadge() {
  const { t } = useI18n();
  return <span className="premium-badge" title={t("premium.tooltip")}>★ {t("premium.label")}</span>;
}
