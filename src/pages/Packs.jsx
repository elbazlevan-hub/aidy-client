import { useState } from "react";
import { Link } from "react-router";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import { useApi } from "../utils/useApi.js";
import { Empty, ErrorBox, Loader } from "../components/States.jsx";
import { dateTime, money } from "../utils/format.js";


// Page "Packs" : acheter des crédits (paiement unique, pas d'abonnement)
export default function Packs() {
  const { user, refresh } = useAuth();
  const { t, lang } = useI18n();
  const { data, loading, error, reload } = useApi("/packs");
  const [chosen, setChosen] = useState(null); // pack en cours de confirmation
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const plan = data.plan;
  const credits = data.credits;

  async function buy() {
    setBuying(true);
    setBuyError(null);
    try {
      const r = await api.post(`/packs/${chosen.id}/buy`);
      setSuccess(t("packs.success", { n: chosen.credits, total: r.credits }));
      setChosen(null);
      await Promise.all([refresh(), reload()]);
    } catch (err) {
      setBuyError(err);
    } finally {
      setBuying(false);
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{t("packs.title")}</h1>
          <p className="muted">{t("packs.subtitle")}</p>
        </div>
        <div className="credit-balance">
          <span className="muted small">{t("packs.balance")}</span>
          <strong>{user?.role === "admin" ? "∞" : credits}</strong>
          {data.jobCredits > 0 && <span className="small">{t("packs.jobBalance", { n: data.jobCredits })}</span>}
          <span className="small">{t(`settings.plans.${plan}`)}</span>
        </div>
      </div>

      {plan === "free" && user?.trialGiven === false && data.purchases.length === 0 && (
        <div className="alert alert-warning" role="status"><span>ℹ️ {t("packs.noTrial")}</span></div>
      )}

      {success && (
        <div className="alert alert-success" role="status">
          <span>{success}</span>
          <Link className="btn btn-small btn-success" to="/offers">{t("packs.goOffers")}</Link>
        </div>
      )}

      <div className="pack-grid">
        {data.packs.map((p) => {
          const locked = p.needsPack && !["paid", "premium"].includes(plan);
          const perLead = new Intl.NumberFormat(lang, { style: "currency", currency: p.currency, minimumFractionDigits: 2 }).format(p.price / p.credits);
          return (
            <article key={p.id} className={`card pack-card${p.id === "premium" ? " pack-best" : ""}${locked ? " pack-locked" : ""}`}>
              {p.id === "premium" && <span className="pack-ribbon">{t("packs.best")}</span>}
                            <h2>{t(`packs.${p.id}.name`)}</h2>
              <div className="pack-price">{money(p.price, p.currency, lang)}</div>
              <p className="muted small">{t("packs.oneTime")}</p>
              <ul className="pack-features">
                <li>{t("packs.leads", { n: p.credits })}</li>
                <li>{t("packs.perLead", { price: perLead })}</li>
                {t(`packs.${p.id}.features`).split("|").map((f) => <li key={f}>{f}</li>)}
              </ul>
              {locked ? (
                <p className="muted small">{t("packs.rechargeLocked")}</p>
              ) : (
                <button
                  className={`btn btn-block ${p.id === "premium" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => { setChosen(p); setSuccess(null); setBuyError(null); }}
                >
                  {t("packs.buy", { price: money(p.price, p.currency, lang) })}
                </button>
              )}
            </article>
          );
        })}
      </div>

      <p className="muted small center">ℹ️ {t("packs.creditRule")}</p>

      {chosen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => !buying && setChosen(null)}>
          <div className="card modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t(`packs.${chosen.id}.name`)} — {money(chosen.price, chosen.currency, lang)}</h2>
            <p>{t("packs.confirmText", { n: chosen.credits })}</p>
            <div className="alert alert-warning"><span>{t("packs.demoNote")}</span></div>
            <ErrorBox error={buyError} />
            <div className="row-actions">
              <button className="btn btn-ghost" onClick={() => setChosen(null)} disabled={buying}>{t("common.cancel")}</button>
              <button className="btn btn-primary" onClick={buy} disabled={buying}>
                {buying ? t("packs.paying") : t("packs.payDemo")}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="card">
        <h2>{t("packs.history")}</h2>
        {data.purchases.length === 0 ? (
          <Empty icon="🧾" title={t("packs.noPurchase")} />
        ) : (
          <ul className="purchase-list">
            {data.purchases.map((p) => (
              <li key={p._id}>
                <span>{t(`packs.${p.packId}.name`)} · +{p.credits}</span>
                <span className="muted small">{dateTime(p.createdAt, lang)}</span>
                <strong>{money(p.price, p.currency, lang)}{p.demo && <span className="badge"> {t("packs.demo")}</span>}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
