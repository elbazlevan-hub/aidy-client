import { Link, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { useI18n, LANGUAGES } from "../i18n/I18nContext.jsx";
import Logo from "../components/Logo.jsx";

export default function Landing() {
  const { user } = useAuth();
  const { t, lang, setLang } = useI18n();
  if (user) return <Navigate to="/today" replace />;

  return (
    <div className="landing">
      <header className="landing-top">
        <Logo to="/" />
        <div className="landing-actions">
          <select className="select-small" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language">
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          <Link to="/login" className="btn btn-ghost">{t("landing.login")}</Link>
        </div>
      </header>

      <section className="hero">
        <h1>{t("landing.tagline")}</h1>
        <p className="hero-text">{t("landing.subtitle")}</p>
        <Link to="/register" className="btn btn-primary btn-large">{t("landing.start")}</Link>
        <p className="muted">{t("landing.free")}</p>
      </section>

      <section className="steps">
        {[1, 2, 3].map((n) => (
          <div key={n} className="card step">
            <div className="step-number">{n}</div>
            <h3>{t(`landing.step${n}`)}</h3>
            <p>{t(`landing.step${n}Text`)}</p>
          </div>
        ))}
      </section>

      <section className="preview card">
        <div className="lead-head">
          <div>
            <div className="lead-title">🔒 Hair salon</div>
            <div className="muted">Lyon · ⭐ 4,6</div>
          </div>
          <span className="score score-hot">70</span>
        </div>
        <div className="tags">
          <span className="tag">✅ {t("reasons.noWebsite")}</span>
          <span className="tag">✅ {t("reasons.whatsappBooking")}</span>
        </div>
        <ul className="perks">
          <li>✍️ {t("lead.aiIncluded")}</li>
          <li>📱 {t("lead.hasMobile")}</li>
        </ul>
      </section>
    </div>
  );
}
