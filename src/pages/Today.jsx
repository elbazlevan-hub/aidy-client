import { Link } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import { useApi } from "../utils/useApi.js";
import { Empty, ErrorBox, Loader } from "../components/States.jsx";
import LeadCard from "../components/LeadCard.jsx";
import MoneyCard from "../components/MoneyCard.jsx";

// le plan du jour : qui relancer, qui contacter, l'argent généré
export default function Today() {
  const { user } = useAuth();
  const { t } = useI18n();
  const today = useApi("/dashboard/today");
  const stats = useApi("/dashboard/stats");
  const inbox = useApi("/dashboard/inbox");
  const offers = useApi("/offers");

  if (today.loading || offers.loading) return <Loader />;
  if (today.error) return <ErrorBox error={today.error} onRetry={today.reload} />;

  const d = today.data;
  const limitReached = d.remainingToday === 0;
  const progress = Math.min(100, Math.round((d.sentToday / d.dailyLimit) * 100));

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>{t("today.hello", { name: user?.name?.split(" ")[0] || "" })}</h1>
          <p className="muted">{t("today.sentToday", { sent: d.sentToday, limit: d.dailyLimit })}</p>
          <div className="progress" aria-hidden="true"><div style={{ width: `${progress}%` }} /></div>
        </div>
      </header>

      {offers.data?.length === 0 ? (
        <Empty icon="🎯" title={t("today.noOffer")}>
          <Link to="/offers/new" className="btn btn-primary">{t("today.createOffer")}</Link>
        </Empty>
      ) : (
        <>
          <div className="grid-2">
            {stats.data && <MoneyCard stats={stats.data} />}
            {inbox.data?.toAnswer > 0 && (
              <Link to="/inbox" className="card highlight">
                <div className="big">💬 {inbox.data.toAnswer}</div>
                <div>{t("today.toAnswer", { n: inbox.data.toAnswer })}</div>
              </Link>
            )}
          </div>

          {limitReached && <div className="alert alert-warning">{t("today.limitReached")}</div>}
          {d.lateFollowUps > 0 && <div className="alert alert-warning">{t("today.late", { n: d.lateFollowUps })}</div>}

          <section>
            <h2>🔁 {t("today.followUps")} <span className="count">{d.followUps.length}</span></h2>
            {d.followUps.length === 0 ? (
              <p className="muted">{t("today.noFollowUps")}</p>
            ) : (
              <div className="cards">{d.followUps.map((l) => <LeadCard key={l._id} lead={l} />)}</div>
            )}
          </section>

          <section>
            <h2>🚀 {t("today.toContact")} <span className="count">{d.toContact.length}</span></h2>
            {d.withoutMessage > 0 && <p className="hint">{t("today.withoutMessage", { n: d.withoutMessage })}</p>}
            {d.toContact.length === 0 ? (
              <p className="muted">{t("today.noToContact")}</p>
            ) : (
              <div className="cards">{d.toContact.map((l) => <LeadCard key={l._id} lead={l} />)}</div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
