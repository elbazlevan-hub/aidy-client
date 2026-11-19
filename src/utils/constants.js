// mêmes valeurs que le serveur (lib/scoring.js, models/offer.model.js)
export const CRITERIA = [
  "noWebsite", "socialOnly", "siteDown", "oldWebsite", "whatsappBooking", "noOnlineBooking",
  "lowRating", "fewReviews", "noSocial", "fewPhotos", "noInstagram", "noHours",
];
export const CURRENCIES = [
  "USD", "EUR", "GBP", "CHF", "CAD", "AUD", "NZD", "JPY", "CNY", "HKD", "SGD", "INR", "KRW",
  "AED", "SAR", "QAR", "KWD", "ILS", "TRY", "EGP", "MAD", "TND", "DZD", "XOF", "XAF", "ZAR", "NGN", "KES",
  "BRL", "MXN", "ARS", "CLP", "COP", "PEN", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RON", "BGN", "RUB", "UAH",
  "THB", "MYR", "IDR", "PHP", "VND",
];

// "EUR — euro" dans la langue de l'utilisateur
export function currencyLabel(code, lang) {
  try {
    return `${code} — ${new Intl.DisplayNames([lang], { type: "currency" }).of(code)}`;
  } catch {
    return code;
  }
}
export const MESSAGE_LANGUAGES = [
  ["fr", "Français"], ["en", "English"], ["es", "Español"], ["de", "Deutsch"],
  ["it", "Italiano"], ["pt", "Português"], ["nl", "Nederlands"], ["ar", "العربية"],
  ["he", "עברית"], ["ru", "Русский"],
];

// langue des messages proposée selon le pays choisi (modifiable)
export const COUNTRY_LANGUAGE = {
  FR: "fr", BE: "fr", CH: "fr", LU: "fr", MC: "fr", CA: "en", MA: "fr", TN: "fr", SN: "fr", CI: "fr",
  GB: "en", US: "en", IE: "en", AU: "en", NZ: "en", ZA: "en",
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es",
  DE: "de", AT: "de", IT: "it", PT: "pt", BR: "pt", NL: "nl",
  AE: "ar", SA: "ar", EG: "ar", IL: "he", RU: "ru",
};
export const STATUSES = ["toContact", "contacted", "interested", "client", "rejected"];
