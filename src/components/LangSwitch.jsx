import { useI18n, LANGUAGES } from "../i18n/I18nContext.jsx";

// changer la langue en un clic : EN · FR · ES
export default function LangSwitch({ className = "" }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label="Language">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          className={l.code === lang ? "on" : ""}
          aria-pressed={l.code === lang}
          title={l.label}
          onClick={() => setLang(l.code)}
        >
          {l.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
