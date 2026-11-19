import { useState } from "react";
import { useI18n } from "../i18n/I18nContext.jsx";
import { copyText } from "../utils/format.js";

// boutons d'envoi : WhatsApp et email s'ouvrent avec le message déjà écrit ;
// Instagram et le reste : on copie d'abord, puis on colle
export default function SendButtons({ links = {}, text }) {
  const { t } = useI18n();
  const [hint, setHint] = useState("");

  async function copy(then) {
    await copyText(text || "");
    setHint(t("lead.copyHint"));
    if (then) window.open(then, "_blank", "noopener");
  }

  return (
    <div className="send">
      <div className="send-buttons">
        {links.whatsapp && (
          <a className="btn btn-whatsapp" href={links.whatsapp} target="_blank" rel="noreferrer">
            {t("lead.sendWhatsapp")}
          </a>
        )}
        {links.email && (
          <a className="btn btn-secondary" href={links.email}>
            {t("lead.sendEmail")}
          </a>
        )}
        {links.instagram && (
          <button className="btn btn-instagram" onClick={() => copy(links.instagram)}>
            {t("lead.copyInstagram")}
          </button>
        )}
        {links.phone && (
          <a className="btn btn-secondary" href={links.phone}>
            {t("lead.call")}
          </a>
        )}
        <button className="btn btn-ghost" onClick={() => copy()}>
          {t("lead.copyMessage")}
        </button>
      </div>
      {hint && <p className="hint success">{hint}</p>}
    </div>
  );
}
