import { useI18n } from "../i18n/I18nContext.jsx";
import { useApi } from "../utils/useApi.js";
import { Empty, ErrorBox, Loader } from "../components/States.jsx";
import MoneyCard from "../components/MoneyCard.jsx";

function Bar({ label, value, max, suffix = "" }) {
  const width = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar"><div style={{ width: `${width}%` }} /></div>
      <span className="bar-value">{value}{suffix}</span>
    </div>
  );
}

export default function Stats() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useApi("/dashboard/stats");

  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const channels = Object.entries(data.byChannel || {});
  const reasons = Object.entries(data.byReason || {}).sort((a, b) => b[1].clientRate - a[1].clientRate);

  return (
    <div className="page">
      <h1>{t("stats.title")}</h1>
      <MoneyCard stats={data} />
      <div className="kpis">
        {[
          ["stats.contacted", data.contacted],
          ["stats.replied", data.replied],
          ["stats.clients", data.clients],
          ["stats.replyRate", `${data.replyRate} %`],
          ["stats.clientRate", `${data.clientRate} %`],
          ["stats.followUps", data.followUpsSent],
        ].map(([key, value]) => (
          <div key={key} className="card kpi">
            <div className="kpi-value">{value}</div>
            <div className="muted small">{t(key)}</div>
          </div>
        ))}
      </div>

      {data.contacted === 0 ? (
        <Empty icon="📈" title={t("stats.empty")} />
      ) : (
        <div className="grid-2">
          <section className="card">
            <h2>{t("stats.byChannel")}</h2>
            {channels.map(([c, s]) => (
              <Bar key={c} label={t(`channels.${c}`)} value={s.replyRate} max={100} suffix=" %" />
            ))}
            <p className="muted small">{t("stats.replyRate")}</p>
          </section>
          <section className="card">
            <h2>{t("stats.byReason")}</h2>
            {data.bestReason ? (
              <p className="hint success">{t("stats.bestReason", { reason: t(`reasons.${data.bestReason.reason}`), rate: data.bestReason.clientRate })}</p>
            ) : (
              <p className="muted small">{t("stats.notEnough")}</p>
            )}
            {reasons.map(([r, s]) => (
              <Bar key={r} label={t(`reasons.${r}`)} value={s.clientRate} max={100} suffix=" %" />
            ))}
            <p className="muted small">{t("stats.clientRate")}</p>
          </section>
        </div>
      )}
    </div>
  );
}
