import { Link } from "react-router";
import { useI18n } from "../i18n/I18nContext.jsx";
import { useApi } from "../utils/useApi.js";
import { Empty, ErrorBox, Loader } from "../components/States.jsx";
import { dateTime } from "../utils/format.js";
import { useAuth } from "../context/AuthContext.jsx";
import PremiumLock, { hasPremium } from "../components/PremiumLock.jsx";
import PremiumBadge from "../components/PremiumBadge.jsx";

// "À répondre" : les prospects qui ont répondu, les plus urgents d'abord
export default function Inbox() {
  const { t, lang } = useI18n();
  const { data, loading, error, reload } = useApi("/dashboard/inbox");
  const { user } = useAuth();

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>{t("inbox.title")} <PremiumBadge /></h1>
          <p className="muted">{t("inbox.subtitle")}</p>
        </div>
      </header>
      {!hasPremium(user) && <PremiumLock text={t("premium.inboxLocked")} />}
      {loading && <Loader />}
      <ErrorBox error={error} onRetry={reload} />
      {data && data.toAnswer === 0 && <Empty icon="🎉" title={t("inbox.empty")} />}
      {data && data.toAnswer > 0 && (
        <>
          <div className="tags">
            {Object.entries(data.counts).filter(([, n]) => n > 0).map(([label, n]) => (
              <span key={label} className="tag">{t(`labels.${label}`)} · {n}</span>
            ))}
          </div>
          <div className="cards">
            {data.leads.map((l) => (
              <Link key={l._id} to={`/leads/${l._id}`} className="card inbox-card">
                <div className="lead-head">
                  <div className="lead-title">{l.businessId?.name}</div>
                  <span className="badge">{t(`labels.${l.replyLabel}`)}</span>
                </div>
                {l.lastReply && (
                  <>
                    <p className="muted small">{t("inbox.lastReply")} · {dateTime(l.lastReply.at, lang)}</p>
                    <p className="quote">« {l.lastReply.text.slice(0, 160)}{l.lastReply.text.length > 160 ? "…" : ""} »</p>
                  </>
                )}
                <span className="btn btn-small btn-primary">{t("inbox.open")} →</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
