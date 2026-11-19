import { createContext, useContext, useEffect, useState } from "react";
import fr from "./fr.js";
import en from "./en.js";
import es from "./es.js";

export const LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];
const DICTS = { fr, en, es };

const I18nContext = createContext(null);

function initialLanguage() {
  try {
    const saved = localStorage.getItem("aidy-lang");
    if (saved && DICTS[saved]) return saved;
  } catch {
    // stockage indisponible : on prend la langue du navigateur
  }
  const nav = (navigator.language || "en").slice(0, 2);
  return DICTS[nav] ? nav : "en";
}

// cherche "a.b.c" dans le dictionnaire, puis remplace {variables}
function translate(dict, key, vars) {
  const value = key.split(".").reduce((obj, k) => obj?.[k], dict);
  const text = typeof value === "string" ? value : key.split(".").reduce((obj, k) => obj?.[k], en) ?? key;
  if (typeof text !== "string") return key;
  return text.replace(/\{(\w+)\}/g, (_, name) => (vars?.[name] ?? `{${name}}`));
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("aidy-lang", lang);
    } catch {
      // pas grave : la langue ne sera juste pas retenue
    }
  }, [lang]);

  const t = (key, vars) => translate(DICTS[lang], key, vars);
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
