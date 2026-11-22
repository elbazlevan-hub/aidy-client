// les langues les plus parlées (traduites à l'avance par le script server/scripts/pretranslate.js)
export const WORLD_LANGUAGE_CODES = ["es", "ar", "he", "de", "it", "pt", "ru", "zh", "ja", "ko", "hi", "tr", "nl", "pl", "uk", "ro", "vi", "id", "th", "fa"];

// langues écrites de droite à gauche
export const RTL_LANGUAGES = ["ar", "he", "fa", "ur", "ps", "yi", "ug", "ku"];

// nom d'une langue dans sa propre langue (ex. "de" -> "Deutsch")
export function nativeName(code) {
  try {
    const name = new Intl.DisplayNames([code], { type: "language" }).of(code);
    return name ? name.charAt(0).toLocaleUpperCase(code) + name.slice(1) : code;
  } catch {
    return code;
  }
}

// nom d'une langue dans la langue de l'app (ex. "de" en français -> "allemand")
export function localName(code, uiLang) {
  try {
    return new Intl.DisplayNames([uiLang], { type: "language" }).of(code) || code;
  } catch {
    return code;
  }
}
