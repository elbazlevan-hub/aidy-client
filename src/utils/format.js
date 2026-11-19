// montants et dates dans la langue de l'utilisateur
export function money(amount, currency = "USD", lang = "fr") {
  try {
    return new Intl.NumberFormat(lang, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount || 0);
  } catch {
    return `${amount || 0} ${currency}`;
  }
}

export function day(date, lang = "fr") {
  if (!date) return "";
  return new Intl.DateTimeFormat(lang, { day: "numeric", month: "short" }).format(new Date(date));
}

export function dateTime(date, lang = "fr") {
  if (!date) return "";
  return new Intl.DateTimeFormat(lang, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}

// "a, b , c" -> ["a", "b", "c"]
export const splitList = (text) =>
  String(text || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // ancien navigateur : on passe par une zone de texte cachée
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}
