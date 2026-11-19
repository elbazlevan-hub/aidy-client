import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { api, API_URL } from "../api.js";
import Help from "../components/Help.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import { useApi } from "../utils/useApi.js";
import { ErrorBox, Loader } from "../components/States.jsx";
import LeadCard from "../components/LeadCard.jsx";
import { money } from "../utils/format.js";

// une offre : un seul gros bouton qui fait tout (recherche + analyse + déblocage des meilleurs),
// puis les prospects prêts à contacter en premier
export default function OfferDetail() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { t, lang } = useI18n();
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const offer = useApi(`/offers/${id}`);
  const leads = useApi(`/offers/${id}/leads`);
  const [step, setStep] = useState(""); // search | analyze | unlock
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(null);
  const [showLocked, setShowLocked] = useState(false);
  const autoStarted = useRef(false);

  const isAdmin = user?.role === "admin";
  const credits = isAdmin ? Infinity : user?.credits ?? 0;

  async function reloadAll() {
    await Promise.all([leads.reload(), offer.reload(), refresh()]);
  }

  function explain(err, kind) {
    if (err.status === 402) return new Error(kind === "search" ? t("offer.trialUsed") : t("offer.outOfCredits"));
    return err;
  }

  // 🚀 tout en un : recherche Google -> analyse des sites -> déblocage des meilleurs avec leur message
  async function findClients() {
    setError(null);
    setNotice("");
    let current = "search";
    try {
      setStep("search");
      const found = await api.post(`/offers/${id}/search`);
      if (!found.found) {
        setNotice(t("offer.nothingFound"));
        return;
      }
      current = "analyze";
      setStep("analyze");
      const analysis = await api.post(`/offers/${id}/analyze`);
      const withProblem = analysis.hot + analysis.warm;
      let unlocked = 0;
      if (withProblem > 0 && credits > 0) {
        current = "unlock";
        setStep("unlock");
        const r = await api.post(`/offers/${id}/unlock`, { count: Math.min(5, credits) });
        unlocked = r.unlocked;
      }
      setNotice(t("offer.doneSummary", { found: found.found, problems: withProblem, ready: unlocked }));
    } catch (err) {
      setError(explain(err, current));
    } finally {
      setStep("");
      await reloadAll();
    }
  }

  async function unlock(leadId) {
    setError(null);
    setNotice("");
    setStep("unlock");
    try {
      if (leadId) await api.post(`/leads/${leadId}/unlock`);
      else await api.post(`/offers/${id}/unlock`, { count: Math.min(5, credits) });
    } catch (err) {
      setError(explain(err, "unlock"));
    } finally {
      setStep("");
      await reloadAll();
    }
  }

  async function remove() {
    if (!window.confirm(t("offer.deleteConfirm"))) return;
    try {
      await api.del(`/offers/${id}`);
      navigate("/offers");
    } catch (err) {
      setError(err);
    }
  }

  // juste après la création de l'offre (?start=1) : on lance tout automatiquement
  useEffect(() => {
    if (params.get("start") && leads.data && leads.data.length === 0 && !autoStarted.current) {
      autoStarted.current = true;
      setParams({}, { replace: true });
      findClients();
    }
  }, [leads.data]);

  if (offer.loading) return <Loader />;
  if (offer.error) return <ErrorBox error={offer.error} onRetry={offer.reload} />;

  const o = offer.data.offer;
  const all = leads.data || [];
  // prêts à contacter : débloqués, pas encore contactés, avec un vrai problème
  const ready = all.filter((l) => !l.locked && l.status === "toContact" && l.score > 0);
  // en cours : déjà contactés, intéressés ou clients (les refusés sont cachés)
  const inProgress = all.filter((l) => !l.locked && ["contacted", "interested", "client"].includes(l.status));
  const locked = all.filter((l) => l.locked && l.score > 0);
  const cities = (o.targetCities?.length ? o.targetCities : [o.targetCity]).filter(Boolean);
  const hasSearched = Boolean(o.lastSearchAt) || all.length > 0;

  return (
    <div className="page">
      <Link to="/offers" className="back">← {t("common.back")}</Link>
      <header className="page-head">
        <div>
          <h1>{o.title}</h1>
          <p className="muted">
            {cities.length ? cities.join(", ") : t("newOffer.wholeCountry")} · {o.targetCountry} · {o.targetCategories.join(", ")}
            {o.priceOnQuote ? ` · ${t("newOffer.onQuote")}` : o.price > 0 && ` · ${money(o.price, o.currency, lang)}`}
          </p>
        </div>
        <div className="mini-actions">
          {hasSearched && (
            <button className="btn btn-ghost btn-small" onClick={findClients} disabled={!!step}>{t("offer.searchAgain")}</button>
          )}
          <Link className="btn btn-ghost btn-small" to={`/offers/${id}/edit`}>{t("offer.edit")}</Link>
          <a className="btn btn-ghost btn-small" href={`${API_URL}/offers/${id}/export`} title={t("help.export")}>{t("offer.export")}</a>
          <button className="btn btn-ghost btn-small danger" onClick={remove} disabled={!!step}>{t("common.delete")}</button>
        </div>
      </header>

      {/* le gros bouton : ce qu'il faut faire maintenant */}
      {!step && !hasSearched && (
        <div className="card cta">
          <h2>{t("offer.ctaTitle")}</h2>
          <p className="muted">{t("offer.ctaText", { n: Math.min(5, credits === Infinity ? 5 : credits) })}</p>
          <button className="btn btn-primary btn-large" onClick={findClients}>{t("offer.findClients")}</button>
          <p className="field-help center">{t("help.findClients")}</p>
        </div>
      )}

      {step && (
        <div className="card progress-card">
          {["search", "analyze", "unlock"].map((s, i) => {
            const order = ["search", "analyze", "unlock"].indexOf(step);
            const state = i < order ? "done" : i === order ? "doing" : "todo";
            return (
              <div key={s} className={`progress-step ${state}`}>
                <span className="dot">{state === "done" ? "✓" : i + 1}</span>
                <span>{t(`offer.step_${s}`)}</span>
                {state === "doing" && <span className="spinner small" aria-hidden="true" />}
              </div>
            );
          })}
          <p className="muted small">{t("offer.pleaseWait")}</p>
        </div>
      )}

      {notice && <div className="alert alert-success">{notice}</div>}
      <ErrorBox error={error} />

      {leads.loading && !step && <Loader />}
      <ErrorBox error={leads.error} onRetry={leads.reload} />

      {/* 1) prêts à contacter */}
      {hasSearched && !step && (
        <section>
          <h2>{t("offer.readyTitle")} <span className="count">{ready.length}</span></h2>
          {ready.length === 0 ? (
            <p className="muted">
              {locked.length ? t("offer.readyEmpty") : all.length || offer.data.noProblemLeads ? t("offer.noProblemAtAll") : t("offer.noLeadsText")}
            </p>
          ) : (
            <>
              <p className="muted small">{t("offer.readyHint")}</p>
              <div className="cards">{ready.map((l) => <LeadCard key={l._id} lead={l} />)}</div>
            </>
          )}
        </section>
      )}

      {hasSearched && !step && inProgress.length > 0 && (
        <section>
          <h2>{t("offer.inProgressTitle")} <span className="count">{inProgress.length}</span></h2>
          <div className="cards">{inProgress.map((l) => <LeadCard key={l._id} lead={l} />)}</div>
        </section>
      )}

      {/* 2) les autres commerces intéressants, à débloquer */}
      {hasSearched && !step && locked.length > 0 && (
        <section className="card unlock-box">
          <div className="card-title-row">
            <div>
              <h2>{t("offer.moreTitle", { n: locked.length })}<Help text={t("help.unlock")} /></h2>
              <p className="muted small">
                {credits > 0 ? t("offer.moreText", { credits: credits === Infinity ? "∞" : credits }) : t("offer.outOfCredits")}
              </p>
            </div>
            {credits <= 0 && (
              <Link className="btn btn-primary" to="/packs">{t("nav.buyCredits")}</Link>
            )}
            {credits > 0 && (
              <button className="btn btn-primary" onClick={() => unlock()}>
                {t("offer.unlock", { n: Math.min(5, credits === Infinity ? 5 : credits, locked.length) })}
              </button>
            )}
          </div>
          <button className="btn btn-ghost btn-small" onClick={() => setShowLocked(!showLocked)}>
            {showLocked ? t("offer.hideLocked") : t("offer.showLocked")}
          </button>
          {showLocked && (
            <div className="cards">
              {locked.map((l) => (
                <LeadCard key={l._id} lead={l} onUnlock={credits > 0 ? () => unlock(l._id) : null} unlocking={!!step} />
              ))}
            </div>
          )}
        </section>
      )}

      {hasSearched && !step && offer.data.noProblemLeads > 0 && (
        <p className="muted small">{t("offer.hiddenNoProblem", { n: offer.data.noProblemLeads })}</p>
      )}
    </div>
  );
}
