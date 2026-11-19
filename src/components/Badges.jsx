import { useI18n } from "../i18n/I18nContext.jsx";

export function StatusBadge({ status }) {
  const { t } = useI18n();
  return <span className={`badge badge-${status}`}>{t(`status.${status}`)}</span>;
}

export function ScoreBadge({ score }) {
  const level = score >= 60 ? "hot" : score >= 30 ? "warm" : "cold";
  return <span className={`score score-${level}`}>{score}</span>;
}

export function ReasonTags({ reasons = [] }) {
  const { t } = useI18n();
  if (!reasons.length) return null;
  return (
    <div className="tags">
      {reasons.map((r) => (
        <span key={r} className="tag">✅ {t(`reasons.${r}`)}</span>
      ))}
    </div>
  );
}
