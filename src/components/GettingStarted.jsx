import { useState } from "react";
import { Link } from "react-router";
import { useI18n } from "../i18n/I18nContext.jsx";
import { useApi } from "../utils/useApi.js";

// les 5 étapes pour bien utiliser AIDY (cochées automatiquement quand elles sont faites)
const STEPS = [
  { key: "profile", to: "/settings" },
  { key: "offer", to: "/offers/new" },
  { key: "unlocked", to: "/offers" },
  { key: "contacted", to: "/today" },
  { key: "replied", to: "/inbox" },
];
const HIDE_KEY = "aidy-onboarding-hidden";

export default function GettingStarted() {
  const { t } = useI18n();
  const { data } = useApi("/dashboard/onboarding");
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(HIDE_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (!data || hidden) return null;
  const done = STEPS.filter((s) => data[s.key]).length;
  if (done === STEPS.length) return null; // tout est fait : plus besoin du guide
  const next = STEPS.find((s) => !data[s.key]);

  function hide() {
    setHidden(true);
    try {
      localStorage.setItem(HIDE_KEY, "1");
    } catch {
      // pas grave : il réapparaîtra au prochain chargement
    }
  }

  return (
    <section className="card onboarding" aria-labelledby="onboarding-title">
      <div className="onboarding-head">
        <div>
          <h2 id="onboarding-title">{t("onboarding.title")}</h2>
          <p className="muted small">{t("onboarding.progress", { done, total: STEPS.length })}</p>
        </div>
        <button type="button" className="btn btn-ghost btn-small" onClick={hide}>{t("onboarding.hide")}</button>
      </div>
      <div className="progress" aria-hidden="true"><div style={{ width: `${(done / STEPS.length) * 100}%` }} /></div>
      <ol className="onboarding-steps">
        {STEPS.map((s) => {
          const ok = data[s.key];
          const isNext = s === next;
          return (
            <li key={s.key} className={ok ? "done" : isNext ? "next" : ""}>
              <span className="step-check" aria-hidden="true">{ok ? "✓" : ""}</span>
              <span className="step-text">{t(`onboarding.${s.key}`)}</span>
              {isNext && <Link className="btn btn-primary btn-small" to={s.to}>{t(`onboarding.${s.key}Action`)}</Link>}
            </li>
          );
        })}
      </ol>
      <Link className="small" to="/guide">{t("onboarding.guide")}</Link>
    </section>
  );
}
