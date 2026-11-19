import { Link } from "react-router";
import { useI18n } from "../i18n/I18nContext.jsx";
import { ReasonTags, ScoreBadge, StatusBadge } from "./Badges.jsx";
import { joinMeta, realCity } from "../utils/format.js";

// une carte de prospect dans une liste : verrouillée (sans nom ni contact) ou débloquée
export default function LeadCard({ lead, onUnlock, unlocking }) {
  const { t } = useI18n();

  if (lead.locked) {
    const p = lead.preview || {};
    return (
      <div className="card lead-card locked">
        <div className="lead-head">
          <div>
            <div className="lead-title"><span className="lock" aria-hidden="true" />{p.category || t("lead.locked")}</div>
            <div className="muted">
              {joinMeta(realCity(p.city), p.rating && `★ ${p.rating} (${t("lead.reviews", { n: p.reviewCount ?? 0 })})`)}
            </div>
          </div>
          <ScoreBadge score={lead.score} />
        </div>
        <ReasonTags reasons={lead.matchReasons} />
        <ul className="perks">
          <li>{t("lead.aiIncluded")}</li>
          {p.hasMobile && <li>{t("lead.hasMobile")}</li>}
          {p.hasEmail && <li>{t("lead.hasEmail")}</li>}
          {p.hasInstagram && <li>{t("lead.hasInstagram")}</li>}
          {p.hasLandline && <li>{t("lead.hasLandline")}</li>}
        </ul>
        {lead.score > 0 ? (
          onUnlock && (
            <button className="btn btn-primary btn-small" onClick={() => onUnlock(lead)} disabled={unlocking}>
              {t("lead.unlockOne")}
            </button>
          )
        ) : (
          <p className="muted small">{t("lead.noProblem")}</p>
        )}
      </div>
    );
  }

  const b = lead.businessId || {};
  return (
    <Link to={`/leads/${lead._id}`} className="card lead-card">
      <div className="lead-head">
        <div>
          <div className="lead-title">{b.name}</div>
          <div className="muted">
            {joinMeta(b.category, realCity(b.city))}
            {b.rating ? ` · ★ ${b.rating}` : ""}
          </div>
        </div>
        <ScoreBadge score={lead.score} />
      </div>
      <ReasonTags reasons={lead.matchReasons} />
      <div className="lead-foot">
        <StatusBadge status={lead.status} />
        {lead.message ? <span className="muted">{t("lead.message")}</span> : <span className="muted">{t("lead.noMessage")}</span>}
      </div>
    </Link>
  );
}
