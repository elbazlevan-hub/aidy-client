import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import { useApi } from "../utils/useApi.js";
import { ErrorBox, Loader } from "../components/States.jsx";
import { ReasonTags, ScoreBadge, StatusBadge } from "../components/Badges.jsx";
import SendButtons from "../components/SendButtons.jsx";
import { dateTime, day, joinMeta, money, realCity } from "../utils/format.js";
import { STATUSES } from "../utils/constants.js";

const CHANNELS = ["whatsapp", "email", "instagram", "phone", "other"];

// fiche d'un prospect : message, envoi, suivi, réponses
export default function LeadDetail() {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: lead, setData: setLead, loading, error, reload } = useApi(`/leads/${id}`);
  const offerId = lead?.offerId;
  const { data: offerData } = useApi(offerId ? `/offers/${offerId}` : null);
  const [busy, setBusy] = useState("");
  const [actionError, setActionError] = useState(null);
  const [notice, setNotice] = useState("");
  const [notes, setNotes] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [showClient, setShowClient] = useState(false);
  const [amount, setAmount] = useState("");
  const [replyText, setReplyText] = useState("");
  const [assistant, setAssistant] = useState(null);

  useEffect(() => {
    if (!lead) return;
    setNotes(lead.notes || "");
    const first = CHANNELS.find((c) => lead.links?.[c]);
    if (first) setChannel(first);
  }, [lead?._id]);

  async function act(kind, action, after) {
    setBusy(kind);
    setActionError(null);
    setNotice("");
    try {
      const result = await action();
      if (after) after(result);
    } catch (err) {
      setActionError(err.status === 402 && kind === "reply" ? new Error(t("lead.premiumOnly")) : err);
    } finally {
      setBusy("");
    }
  }

  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const offer = offerData?.offer;
  const currency = offer?.currency || "USD";

  if (lead.locked) {
    return (
      <div className="page narrow">
        <Link to={`/offers/${lead.offerId}`} className="back">← {t("common.back")}</Link>
        <div className="card">
          <h1>{lead.preview?.category}</h1>
          <ReasonTags reasons={lead.matchReasons} />
          <button className="btn btn-primary" onClick={() => act("unlock", () => api.post(`/leads/${id}/unlock`), (r) => setLead(r.lead))}>
            {t("lead.unlockOne")}
          </button>
          <ErrorBox error={actionError} />
        </div>
      </div>
    );
  }

  const b = lead.businessId || {};
  const next = lead.nextMessage;
  const canFollow = ["toContact", "contacted"].includes(lead.status);

  const updateLead = (body, kind = "update") =>
    act(kind, () => api.patch(`/leads/${id}`, body), (r) => {
      setLead(r);
      setNotice(t("common.saved"));
    });

  return (
    <div className="page lead-page">
      <Link to={`/offers/${lead.offerId}`} className="back">← {t("common.back")}</Link>

      <header className="page-head">
        <div>
          <h1>{b.name}</h1>
          <p className="muted">
            {joinMeta(b.category, realCity(b.city))}
            {b.rating ? ` · ★ ${b.rating} (${t("lead.reviews", { n: b.reviewCount ?? 0 })})` : ""}
          </p>
        </div>
        <div className="head-badges">
          <ScoreBadge score={lead.score} />
          <StatusBadge status={lead.status} />
        </div>
      </header>

      {notice && <div className="alert alert-success">{notice}</div>}
      <ErrorBox error={actionError} />
      {!lead.matchReasons?.length && <div className="alert alert-warning">{t("lead.noProblemAlert")}</div>}

      <div className="lead-grid">
        <div className="col">
          {/* message à envoyer */}
          {canFollow && (
            <section className="card">
              <div className="card-title-row">
                <h2>{t(next?.kind === "followUp" ? "lead.followUpMessage" : "lead.message")}</h2>
                {next?.kind !== "followUp" && lead.message && (
                  <button className="btn btn-ghost btn-small" disabled={!!busy} onClick={() => act("write", () => api.post(`/leads/${id}/message`), setLead)}>
                    ↻ {t("lead.rewrite")}
                  </button>
                )}
              </div>
              {next?.text ? (
                <>
                  {next.subject && <p className="subject">{next.subject}</p>}
                  <pre className="message">{next.text}</pre>
                  <SendButtons links={lead.links} text={next.text} />
                  <div className="sent-row">
                    <select value={channel} onChange={(e) => setChannel(e.target.value)} aria-label={t("lead.status")}>
                      {CHANNELS.map((c) => <option key={c} value={c}>{t(`channels.${c}`)}</option>)}
                    </select>
                    <button
                      className="btn btn-primary"
                      disabled={!!busy}
                      onClick={() =>
                        act("contact", () => api.post(`/leads/${id}/contact`, { channel }), (r) => {
                          setLead(r.lead);
                          setNotice(r.lead.followUpAt ? t("lead.markedSent", { date: day(r.lead.followUpAt, lang) }) : t("common.saved"));
                        })
                      }
                    >
                      {t("lead.markSent")}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="muted">{t("lead.noMessage")}</p>
                  <button className="btn btn-primary" disabled={!!busy} onClick={() => act("write", () => api.post(`/leads/${id}/message`), setLead)}>
                    {busy === "write" ? t("common.loading") : t("lead.writeMessage")}
                  </button>
                </>
              )}
              {lead.status === "contacted" && (
                <p className="muted small">{lead.followUpAt ? t("lead.nextFollowUp", { date: day(lead.followUpAt, lang) }) : t("lead.noMoreFollowUps")}</p>
              )}
            </section>
          )}

          {/* conversation + assistant de réponse */}
          {lead.status !== "toContact" && (
            <section className="card">
              <h2>{t("lead.conversation")}</h2>
              <div className="conversation">
                {lead.message && <div className="bubble me"><pre>{lead.message}</pre></div>}
                {(lead.replies || []).map((r, i) => (
                  <div key={i} className={`bubble ${r.from === "me" ? "me" : "them"}`}>
                    {r.label && <span className="bubble-label">{t(`labels.${r.label}`)}</span>}
                    <pre>{r.text}</pre>
                    <span className="bubble-time">{dateTime(r.at, lang)}</span>
                  </div>
                ))}
              </div>

              {lead.suggestedReply && (
                <div className="assistant">
                  <h3>{t("lead.aidyReply")}</h3>
                  <pre className="message">{lead.suggestedReply}</pre>
                  {assistant?.missingInfo?.length > 0 && <p className="hint">{t("lead.missingInfo", { list: assistant.missingInfo.join(", ") })}</p>}
                  <SendButtons links={assistant?.links || {}} text={lead.suggestedReply} />
                  <button className="btn btn-primary" disabled={!!busy} onClick={() => act("sent", () => api.post(`/leads/${id}/reply/sent`, {}), (r) => { setLead(r); setAssistant(null); })}>
                    {t("lead.replySent")}
                  </button>
                </div>
              )}

              {lead.status !== "rejected" && (
                <div className="paste">
                  <label className="field">
                    <span>{t("lead.pasteReply")}</span>
                    <textarea rows={3} value={replyText} placeholder={t("lead.pasteReplyPlaceholder")} onChange={(e) => setReplyText(e.target.value)} />
                  </label>
                  <button
                    className="btn btn-accent"
                    disabled={!!busy || !replyText.trim()}
                    onClick={() =>
                      act("reply", () => api.post(`/leads/${id}/reply`, { text: replyText.trim() }), (r) => {
                        setLead(r.lead);
                        setAssistant(r);
                        setReplyText("");
                        setNotice(t(`labels.${r.label}`));
                      })
                    }
                  >
                    {busy === "reply" ? t("lead.analyzingReply") : t("lead.analyzeReply")}
                  </button>
                  {user?.plan !== "premium" && user?.role !== "admin" && <p className="muted small">{t("lead.premiumOnly")} <Link to="/packs">{t("nav.seePacks")}</Link></p>}
                </div>
              )}
            </section>
          )}
        </div>

        <div className="col">
          {/* suivi */}
          <section className="card">
            <label className="field">
              <span>{t("lead.status")}</span>
              <select value={lead.status} disabled={!!busy} onChange={(e) => (e.target.value === "client" ? setShowClient(true) : updateLead({ status: e.target.value }))}>
                {STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
              </select>
            </label>
            {lead.status !== "client" && (
              <button className="btn btn-success btn-block" onClick={() => { setAmount(offer?.price || ""); setShowClient(true); }}>
                {t("lead.becameClient")}
              </button>
            )}
            {lead.status === "client" && (
              <div className="deal">
                <div className="money-amount small">{money(lead.dealValue, currency, lang)}</div>
                <button className="btn btn-ghost btn-small" onClick={() => { setAmount(lead.dealValue ?? ""); setShowClient(true); }}>{t("lead.dealValue")}</button>
                {lead.dealHistory?.length > 1 && (
                  <details>
                    <summary className="muted small">{t("lead.dealHistory")}</summary>
                    <ul className="small">
                      {lead.dealHistory.map((h, i) => <li key={i}>{money(h.value, currency, lang)} · {dateTime(h.at, lang)}</li>)}
                    </ul>
                  </details>
                )}
              </div>
            )}
            {showClient && (
              <form
                className="client-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const value = Number(amount);
                  if (!(value >= 0)) return;
                  setShowClient(false);
                  updateLead({ status: "client", dealValue: value });
                }}
              >
                <label className="field">
                  <span>{t("lead.howMuch")}</span>
                  <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus required />
                </label>
                <div className="row">
                  <button className="btn btn-success">{t("common.confirm")}</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowClient(false)}>{t("common.cancel")}</button>
                </div>
              </form>
            )}
            <label className="field">
              <span>{t("lead.notes")}</span>
              <textarea rows={3} value={notes} placeholder={t("lead.notesPlaceholder")} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <button className="btn btn-ghost btn-small" disabled={!!busy || notes === (lead.notes || "")} onClick={() => updateLead({ notes })}>
              {t("common.save")}
            </button>
          </section>

          {/* infos du commerce */}
          <section className="card">
            <h3>{t("lead.reasons")}</h3>
            {lead.matchReasons?.length ? <ReasonTags reasons={lead.matchReasons} /> : <p className="muted small">{t("lead.noProblem")}</p>}
            {b.address && <p className="small"><strong>{t("lead.address")} :</strong> {b.address}</p>}
            {b.website && <p className="small"><strong>{t("lead.website")} :</strong> <a href={b.website} target="_blank" rel="noreferrer">{b.website.replace(/^https?:\/\/(www\.)?/, "").split(/[/?#]/)[0]}</a></p>}
            {b.phone && <p className="small">📱 {b.phone}</p>}
            {b.email && <p className="small">✉️ {b.email}</p>}
            {b.instagram && <p className="small">📸 <a href={b.instagram} target="_blank" rel="noreferrer">{b.instagram.replace("https://instagram.com/", "@")}</a></p>}
            <button
              className="btn btn-ghost danger btn-small"
              onClick={() => {
                if (!window.confirm(t("lead.blockConfirm"))) return;
                act("block", () => api.post(`/leads/${id}/block`, {}), () => navigate(`/offers/${lead.offerId}`));
              }}
            >
              {t("lead.block")}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
