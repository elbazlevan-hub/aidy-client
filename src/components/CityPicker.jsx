import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nContext.jsx";
import { splitList } from "../utils/format.js";

// mots qui veulent dire "partout" : ce n'est pas une ville, on propose "tout le pays"
const EVERYWHERE = /^(tou(t|te|tes|s)|partout|all|every|everywhere|whole|any|todas?|todos?|cualquier|כל)(?=\s|$)/i;

// "Où chercher ?" : tout le pays, ou des villes précises (ajoutées une par une)
export default function CityPicker({ value, onChange, error }) {
  const { t } = useI18n();
  const cities = splitList(value);
  const [mode, setMode] = useState(cities.length ? "cities" : "country");
  const [draft, setDraft] = useState("");
  const [warning, setWarning] = useState("");

  useEffect(() => {
    if (cities.length) setMode("cities");
  }, [value]);

  function add(text) {
    const name = text.trim().replace(/,$/, "").trim();
    if (!name) return;
    if (EVERYWHERE.test(name)) {
      // "toutes les villes" -> on passe en "tout le pays"
      setWarning(t("newOffer.everywhereHint"));
      setMode("country");
      setDraft("");
      onChange("");
      return;
    }
    if (cities.some((c) => c.toLowerCase() === name.toLowerCase()) || cities.length >= 10) {
      setDraft("");
      return;
    }
    onChange([...cities, name].join(", "));
    setDraft("");
    setWarning("");
  }

  function onKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && cities.length) {
      onChange(cities.slice(0, -1).join(", "));
    }
  }

  return (
    <fieldset className="field">
      <legend>{t("newOffer.where")}</legend>
      <div className="segmented">
        <label className={mode === "country" ? "on" : ""}>
          <input type="radio" checked={mode === "country"} onChange={() => { setMode("country"); onChange(""); setWarning(""); }} />
          {t("newOffer.wholeCountry")}
        </label>
        <label className={mode === "cities" ? "on" : ""}>
          <input type="radio" checked={mode === "cities"} onChange={() => { setMode("cities"); setWarning(""); }} />
          {t("newOffer.someCities")}
        </label>
      </div>
      {mode === "cities" && (
        <div className={`chip-input${error ? " invalid" : ""}`}>
          {cities.map((c) => (
            <span key={c} className="chip on">
              {c}
              <button type="button" aria-label="×" onClick={() => onChange(cities.filter((x) => x !== c).join(", "))}>×</button>
            </span>
          ))}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => add(draft)}
            placeholder={cities.length ? "" : t("newOffer.cityPlaceholder")}
          />
        </div>
      )}
      {warning && <small className="hint success">{warning}</small>}
      {error ? <small className="field-error">{error}</small> : mode === "cities" && <small className="muted">{t("newOffer.citiesHint")}</small>}
    </fieldset>
  );
}
