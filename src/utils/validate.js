// validation côté client (le serveur revérifie tout avec Zod)
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
export const isStrongPassword = (v) => v.length >= 8 && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v);
export const isUrlOrEmpty = (v) => !v || /^https?:\/\/\S+\.\S+/.test(v.trim());
export const isCountry = (v) => /^[A-Za-z]{2}$/.test(String(v).trim());

// emails jetables (même liste que le serveur, lib/antiAbuse.js) : refusés à l'inscription
const DISPOSABLE_DOMAINS = new Set([
  "yopmail.com", "yopmail.fr", "yopmail.net", "cool.fr.nf", "jetable.fr.nf", "courriel.fr.nf", "moncourrier.fr.nf",
  "monemail.fr.nf", "monmail.fr.nf", "nospam.ze.tc", "nomail.xl.cx", "mega.zik.dj", "speed.1s.fr",
  "jetable.org", "jetable.com", "trashmail.com", "trashmail.fr", "trashmail.de", "trashmail.net", "trash-mail.com",
  "mailinator.com", "mailinator.net", "mailinator2.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
  "guerrillamail.biz", "guerrillamail.de", "sharklasers.com", "grr.la", "guerrillamailblock.com", "spam4.me",
  "10minutemail.com", "10minutemail.net", "10minemail.com", "20minutemail.com", "temp-mail.org", "temp-mail.io",
  "tempmail.com", "tempmail.net", "tempmail.dev", "tempmailo.com", "tempr.email", "temp-mail.ru", "tmpmail.org",
  "tmpmail.net", "throwawaymail.com", "getnada.com", "nada.email", "dispostable.com", "maildrop.cc", "mailnesia.com",
  "mintemail.com", "mohmal.com", "emailondeck.com", "fakeinbox.com", "fakemail.net", "spamgourmet.com",
  "mailcatch.com", "mytemp.email", "mailpoof.com", "burnermail.io", "discard.email", "inboxkitten.com",
  "1secmail.com", "1secmail.net", "1secmail.org", "emailfake.com", "email-fake.com", "crazymailing.com",
  "minuteinbox.com", "moakt.com", "tempail.com", "luxusmail.org", "mail.tm", "mail.gw", "dropmail.me",
  "firemail.cc", "spambox.us", "mailsac.com", "harakirimail.com", "anonbox.net", "byom.de", "wegwerfmail.de",
  "einrot.com", "33mail.com", "linshiyouxiang.net", "emltmp.com", "tmail.ws", "trbvm.com", "kzccv.com",
]);
export function isDisposableEmail(email) {
  const parts = (String(email).trim().toLowerCase().split("@")[1] || "").split(".");
  for (let i = 0; i < parts.length - 1; i++) if (DISPOSABLE_DOMAINS.has(parts.slice(i).join("."))) return true;
  return false;
}
