import { useI18n } from "../i18n/I18nContext.jsx";

export function StatusBadge({ status }) {
  const { t } = useI18n();
  return <span className={`badge badge-${status}`}>{t(`status.${status}`)}</span>;
}

// le score dans un petit viseur qui se remplit (comme le logo)
export function ScoreBadge({ score }) {
  const level = score >= 60 ? "hot" : score >= 30 ? "warm" : "cold";
  const r = 19;
  const length = 2 * Math.PI * r;
  return (
    <span className={`score score-${level}`} title={`${score}/100`}>
      <svg viewBox="0 0 46 46" aria-hidden="true">
        <circle className="track" cx="23" cy="23" r={r} />
        <circle className="fill" cx="23" cy="23" r={r} strokeDasharray={length} strokeDashoffset={length * (1 - Math.min(score, 100) / 100)} />
      </svg>
      {score}
    </span>
  );
}

export function ReasonTags({ reasons = [] }) {
  const { t } = useI18n();
  if (!reasons.length) return null;
  return (
    <div className="tags">
      {reasons.map((r) => (
        <span key={r} className="tag"><span className="tag-dot" aria-hidden="true" />{t(`reasons.${r}`)}</span>
      ))}
    </div>
  );
}
