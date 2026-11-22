import { createContext, useContext, useEffect, useState } from "react";
import fr from "./fr.js";
import en from "./en.js";
import es from "./es.js";
import { api } from "../api.js";
import { RTL_LANGUAGES, WORLD_LANGUAGE_CODES } from "./worldLanguages.js";

// langues traduites à la main (incluses dans l'app)
const DICTS = { fr, en, es };
// langues proposées en haut des pages publiques (accueil, connexion)
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];
// toutes les autres langues du monde : traduites par l'IA d'AIDY la 1re fois, puis gardées
const isKnown = (code) => Boolean(DICTS[code]) || WORLD_LANGUAGE_CODES.includes(code);

// petite empreinte des textes anglais : si on change les textes, l'app est retraduite
function hashOf(text) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
const EN_HASH = hashOf(JSON.stringify(en));
const cacheKey = (lang) => `aidy-dict-${lang}-${EN_HASH}`;

function readCache(lang) {
  try {
    const saved = localStorage.getItem(cacheKey(lang));
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function writeCache(lang, dict) {
  try {
    // on efface les anciennes traductions de cette langue, puis on garde la nouvelle
    Object.keys(localStorage).filter((k) => k.startsWith(`aidy-dict-${lang}-`)).forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(cacheKey(lang), JSON.stringify(dict));
  } catch {
    // stockage plein ou indisponible : la traduction sera redemandée la prochaine fois
  }
}

const I18nContext = createContext(null);

function initialLanguage() {
  try {
    const saved = localStorage.getItem("aidy-lang");
    if (saved && isKnown(saved)) return saved;
  } catch {
    // stockage indisponible : on prend la langue du navigateur
  }
  const nav = (navigator.language || "en").slice(0, 2);
  return DICTS[nav] ? nav : "en";
}

// cherche "a.b.c" dans le dictionnaire, puis remplace {variables} (sinon : texte anglais)
function translate(dict, key, vars) {
  const value = key.split(".").reduce((obj, k) => obj?.[k], dict);
  const text = typeof value === "string" ? value : key.split(".").reduce((obj, k) => obj?.[k], en) ?? key;
  if (typeof text !== "string") return key;
  return text.replace(/\{(\w+)\}/g, (_, name) => (vars?.[name] ?? `{${name}}`));
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(initialLanguage);
  const [aiDict, setAiDict] = useState(() => (DICTS[lang] ? null : readCache(lang)));
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState("");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGUAGES.includes(lang.slice(0, 2)) ? "rtl" : "ltr";
    try {
      localStorage.setItem("aidy-lang", lang);
    } catch {
      // pas grave : la langue ne sera juste pas retenue
    }
  }, [lang]);

  // langue sans traduction incluse : on la demande à l'IA (en attendant, l'app reste en anglais)
  useEffect(() => {
    setTranslateError("");
    if (DICTS[lang]) return setAiDict(null);
    const cached = readCache(lang);
    if (cached) return setAiDict(cached);

    let cancelled = false;
    setAiDict(null);
    setTranslating(true);
    api
      .post(`/i18n/${lang}`, { source: en })
      .then((data) => {
        if (cancelled) return;
        writeCache(lang, data.dict);
        setAiDict(data.dict);
      })
      .catch(() => !cancelled && setTranslateError("failed"))
      .finally(() => !cancelled && setTranslating(false));
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const dict = DICTS[lang] || aiDict || en;
  const t = (key, vars) => translate(dict, key, vars);
  return (
    <I18nContext.Provider value={{ lang, setLang, t, translating, translateError }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
