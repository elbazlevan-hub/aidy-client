import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import Logo from "../components/Logo.jsx";
import LangSwitch from "../components/LangSwitch.jsx";

// les points du radar (commerces de la ville) ; "target" = un commerce qui a un problème
const DOTS = [
  [18, 30], [27, 64], [34, 22], [41, 47, 0], [46, 78], [55, 33], [60, 58], [66, 18, 1], [70, 71], [77, 42],
  [24, 46], [52, 86], [81, 60, 2], [38, 70], [62, 40], [30, 82], [73, 28], [48, 14], [86, 38], [14, 58],
];
const TARGETS = [
  { name: "Le Petit Comptoir", category: "Restaurant", reason: "noWebsite", score: 85 },
  { name: "Maison Rossi", category: "Pizzeria", reason: "whatsappBooking", score: 75 },
  { name: "Studio Belle", category: "Hair salon", reason: "oldWebsite", score: 70 },
];
const reduceMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// le radar : il balaie la ville, se verrouille sur un commerce, puis AIDY écrit le message
function Radar() {
  const { t } = useI18n();
  const [target, setTarget] = useState(0);
  const [typed, setTyped] = useState(0);
  const still = reduceMotion();
  const current = TARGETS[target];
  const message = t(`landing.demo${target + 1}`);

  useEffect(() => {
    if (still) return;
    const id = setInterval(() => { setTarget((n) => (n + 1) % TARGETS.length); setTyped(0); }, 6500);
    return () => clearInterval(id);
  }, [still]);

  useEffect(() => {
    if (still) return setTyped(message.length);
    if (typed >= message.length) return;
    const id = setTimeout(() => setTyped((n) => n + 2), typed === 0 ? 900 : 22);
    return () => clearTimeout(id);
  }, [typed, message, still]);

  return (
    <div className="radar-wrap">
      <div className="radar" aria-hidden="true">
        <div className="radar-sweep" />
        {DOTS.map(([x, y, i], k) => (
          <span key={k} className={`radar-dot${i !== undefined ? " is-target" : ""}${i === target ? " locked" : ""}`} style={{ left: `${x}%`, top: `${y}%` }}>
            {i === target && <span className="reticle" />}
          </span>
        ))}
        <div className="radar-label">{t("landing.scanning")}</div>
      </div>

      <div key={target} className="radar-card" role="img" aria-label={`${current.name}: ${t(`reasons.${current.reason}`)}`}>
        <div className="radar-card-head">
          <div>
            <div className="radar-card-name">{current.name}</div>
            <div className="radar-card-meta">{current.category}, Paris</div>
          </div>
          <span className="radar-card-score">{current.score}</span>
        </div>
        <span className="tag"><span className="tag-dot" />{t(`reasons.${current.reason}`)}</span>
        <p className="radar-card-msg">
          {message.slice(0, typed)}
          {typed < message.length && <span className="caret" />}
        </p>
      </div>
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const { t } = useI18n();
  if (user) return <Navigate to="/today" replace />;

  return (
    <div className="landing">
      <header className="landing-top">
        <Logo to="/" height={30} />
        <div className="landing-actions">
          <LangSwitch />
          <Link to="/login" className="btn btn-ghost btn-small">{t("landing.login")}</Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <h1>{t("landing.tagline")}</h1>
          <p className="hero-text">{t("landing.subtitle")}</p>
          <div className="fast">
            <p className="fast-title">{t("landing.fastTitle")}</p>
            <ul className="fast-stats">
              <li><strong>5 min</strong><span>{t("landing.fastTime")}</span></li>
              <li><strong>120</strong><span>{t("landing.fastShops")}</span></li>
              <li><strong>2 {t("landing.fastClicksUnit")}</strong><span>{t("landing.fastClicks")}</span></li>
            </ul>
            <p className="fast-text">{t("landing.fastText")}</p>
          </div>
          <p className="money-line">
            <strong>{t("landing.moneyTitle")}</strong> {t("landing.moneyText")}
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-large">{t("landing.start")}</Link>
            <span className="hero-note">{t("landing.free")}</span>
          </div>
        </div>
        <Radar />
      </section>

    </div>
  );
}
