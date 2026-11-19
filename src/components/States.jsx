import { useI18n } from "../i18n/I18nContext.jsx";

// écran de chargement
export function Loader({ text }) {
  const { t } = useI18n();
  return (
    <div className="state">
      <div className="spinner" aria-hidden="true" />
      <p>{text || t("common.loading")}</p>
    </div>
  );
}

// message d'erreur (avec bouton "Réessayer" si onRetry)
export function ErrorBox({ error, onRetry }) {
  const { t } = useI18n();
  if (!error) return null;
  const text = error.message === "network" ? t("common.network") : error.message || t("common.error");
  return (
    <div className="alert alert-error" role="alert">
      <span>{text}</span>
      {onRetry && (
        <button className="btn btn-small btn-ghost" onClick={onRetry}>
          {t("common.retry")}
        </button>
      )}
    </div>
  );
}

// liste vide
export function Empty({ title, text, children }) {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden="true"><span className="empty-reticle" /></div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}
