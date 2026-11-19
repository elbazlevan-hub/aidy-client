import { useState } from "react";
import { useI18n } from "../i18n/I18nContext.jsx";
import { copyText, money } from "../utils/format.js";

// compteur "Argent généré avec AIDY" (vrais clients) + bouton de partage
export default function MoneyCard({ stats }) {
  const { t, lang } = useI18n();
  const [shared, setShared] = useState("");

  const entries = Object.entries(stats?.money || {});
  const main = entries.sort((a, b) => b[1].earned - a[1].earned)[0];
  const [currency, m] = main || ["EUR", { earned: 0, potential: 0, clients: 0, interested: 0 }];
  const amount = money(m.earned, currency, lang);

  async function share() {
    const text = `${t("money.shareText", { clients: m.clients, amount })} 🚀`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // partage annulé : on copie à la place
      }
    }
    await copyText(text);
    setShared(t("money.shareCopied"));
  }

  return (
    <div className="card money">
      <div className="money-label">💰 {t("money.earned")}</div>
      <div className="money-amount">{amount}</div>
      <div className="money-sub">
        {t("money.clients", { n: m.clients })}
        {m.potential > 0 && ` · ${t("money.potential", { amount: money(m.potential, currency, lang), n: m.interested })}`}
      </div>
      {m.clients > 0 && (
        <button className="btn btn-light btn-small" onClick={share}>
          {t("money.share")}
        </button>
      )}
      {shared && <p className="hint">{shared}</p>}
    </div>
  );
}
