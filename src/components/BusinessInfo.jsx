import { useI18n } from "../i18n/I18nContext.jsx";
import { joinMeta, realCity } from "../utils/format.js";

const host = (url) => url.replace(/^https?:\/\/(www\.)?/, "").split(/[/?#]/)[0];

// une ligne « libellé : valeur » ; rien si la valeur est vide
function Row({ label, children }) {
  if (children === undefined || children === null || children === "" || children === false) return null;
  return (
    <div className="biz-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

// oui / non avec une pastille verte ou rouge
function YesNo({ ok, yes, no }) {
  return <span className={ok ? "yes" : "no"}>{ok ? yes : no}</span>;
}

// tout ce qu'AIDY sait sur le commerce : contacts, fiche Google, site, avis
// diagnosis = false pour les offres sans problème (ex. fournisseur d'eau) : on cache l'analyse du site et des photos
export default function BusinessInfo({ business: b, diagnosis = true }) {
  const { t } = useI18n();
  const a = b.analysis || {};
  const site = b.website || "";
  const siteKind = /wa\.me|whatsapp/i.test(site) ? "whatsapp" : /facebook|instagram|linktr\.ee|tiktok/i.test(site) ? "social" : site ? "site" : "";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(joinMeta(b.name, b.address))}${b.googlePlaceId ? `&query_place_id=${b.googlePlaceId}` : ""}`;
  const reviews = (b.reviews || []).filter((r) => r.text).slice(0, 3);
  const year = new Date().getFullYear();

  return (
    <div className="biz">
      <dl className="biz-list">
        <Row label={t("biz.type")}>{joinMeta(b.category, realCity(b.city))}</Row>
        <Row label={t("lead.address")}>{b.address}</Row>
        <Row label={t("biz.phone")}>{b.phone && <a href={`tel:${b.phone.replace(/\s/g, "")}`}>{b.phone}</a>}</Row>
        <Row label={t("biz.landline")}>{b.landline && <a href={`tel:${b.landline.replace(/\s/g, "")}`}>{b.landline}</a>}</Row>
        <Row label={t("biz.email")}>{b.email && <a href={`mailto:${b.email}`}>{b.email}</a>}</Row>
        <Row label="Instagram">{b.instagram && <a href={b.instagram} target="_blank" rel="noreferrer">{b.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "")}</a>}</Row>
        <Row label={t("lead.website")}>
          {siteKind === "" && <span className={diagnosis ? "no" : "muted"}>{t("biz.noSite")}</span>}
          {siteKind === "whatsapp" && <span className={diagnosis ? "no" : "muted"}>{t("biz.whatsappLink")}</span>}
          {siteKind === "social" && <><span className={diagnosis ? "no" : "muted"}>{t("biz.socialOnly")}</span> · <a href={site} target="_blank" rel="noreferrer">{host(site)}</a></>}
          {siteKind === "site" && <a href={site} target="_blank" rel="noreferrer">{host(site)}</a>}
        </Row>
      </dl>

      <h4>{t("biz.google")}</h4>
      <dl className="biz-list">
        <Row label={t("biz.rating")}>{b.rating ? `★ ${b.rating} · ${t("lead.reviews", { n: b.reviewCount ?? 0 })}` : t("biz.noRating")}</Row>
        <Row label={t("biz.photos")}>{diagnosis && b.photoCount !== undefined && <YesNo ok={b.photoCount >= 5} yes={b.photoCount >= 10 ? "10+" : String(b.photoCount)} no={String(b.photoCount)} />}</Row>
        <Row label={t("biz.hours")}>{diagnosis && b.hasHours !== undefined && <YesNo ok={b.hasHours} yes={t("biz.yes")} no={t("biz.missing")} />}</Row>
      </dl>

      {diagnosis && !a.hasWebsite && a.deliveryPlatforms?.length > 0 && (
        <dl className="biz-list biz-gap"><Row label={t("biz.booking")}><span className="yes">{a.deliveryPlatforms.join(", ")}</span></Row></dl>
      )}

      {diagnosis && a.hasWebsite && (
        <>
          <h4>{t("biz.siteCheck")}</h4>
          <dl className="biz-list">
            <Row label={t("biz.works")}><YesNo ok={a.siteReachable !== false} yes={t("biz.yes")} no={t("biz.siteDown")} /></Row>
            {a.blockedByBot ? (
              <Row label={t("biz.note")}>{t("biz.blocked")}</Row>
            ) : (
              <>
                <Row label={t("biz.secure")}>{a.https !== undefined && <YesNo ok={a.https} yes={t("biz.yes")} no={t("biz.no")} />}</Row>
                <Row label={t("biz.mobile")}>{a.mobileFriendly !== undefined && <YesNo ok={a.mobileFriendly} yes={t("biz.yes")} no={t("biz.no")} />}</Row>
                <Row label={t("biz.updated")}>{a.copyrightYear && <YesNo ok={a.copyrightYear >= year - 2} yes={String(a.copyrightYear)} no={String(a.copyrightYear)} />}</Row>
                <Row label={t("biz.booking")}><YesNo ok={a.onlineBooking} yes={a.deliveryPlatforms?.length ? a.deliveryPlatforms.join(", ") : t("biz.yes")} no={a.whatsappBooking ? t("biz.byWhatsapp") : t("biz.no")} /></Row>
              </>
            )}
          </dl>
        </>
      )}

      {reviews.length > 0 && (
        <>
          <h4>{t("biz.reviews")}</h4>
          <ul className="biz-reviews">
            {reviews.map((r, i) => (
              <li key={i}>
                <span className="biz-stars">{"★".repeat(Math.round(r.rating || 0))}</span>
                <p dir="auto">{r.text.length > 180 ? `${r.text.slice(0, 180)}…` : r.text}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      <a className="btn btn-ghost btn-small biz-maps" href={mapsUrl} target="_blank" rel="noreferrer">{t("biz.openMaps")}</a>
    </div>
  );
}
