import { useI18n } from "../i18n/I18nContext.jsx";

const SECTIONS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"];

// le guide complet : tout ce qu'AIDY sait faire, étape par étape
export default function Guide() {
  const { t } = useI18n();
  return (
    <div className="page narrow guide">
      <h1>{t("guide.title")}</h1>
      <p className="muted">{t("guide.subtitle")}</p>

      <nav className="card guide-toc" aria-label={t("guide.toc")}>
        <h2 className="small">{t("guide.toc")}</h2>
        <ul>
          {SECTIONS.map((s) => (
            <li key={s}><a href={`#${s}`}>{t(`guide.${s}.title`)}</a></li>
          ))}
        </ul>
      </nav>

      {SECTIONS.map((s) => {
        const text = t(`guide.${s}.text`);
        return (
          <section key={s} id={s} className="card guide-section">
            <h2>{t(`guide.${s}.title`)}</h2>
            {text && <p>{text}</p>}
            <ul className="perks">
              {t(`guide.${s}.tips`).split("|").map((tip) => <li key={tip}>{tip}</li>)}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
