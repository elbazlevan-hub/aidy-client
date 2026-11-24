import { Link } from "react-router";
import { useI18n } from "../i18n/I18nContext.jsx";
import { useApi } from "../utils/useApi.js";
import { Empty, ErrorBox, Loader } from "../components/States.jsx";
import { money } from "../utils/format.js";
import GlobalSearch from "../components/GlobalSearch.jsx";

export default function Offers() {
  const { t, lang } = useI18n();
  const { data, loading, error, reload } = useApi("/offers");

  return (
    <div className="page">
      <header className="page-head">
        <h1>{t("offers.title")}</h1>
        <Link to="/offers/new" className="btn btn-primary">+ {t("offers.new")}</Link>
      </header>
      {/* retrouver vite un commerce contacté, dans toutes les offres (ex. pour le passer en « Refusé ») */}
      <GlobalSearch className="search-page" />
      {loading && <Loader />}
      <ErrorBox error={error} onRetry={reload} />
      {data && data.length === 0 && (
        <Empty icon="🎯" title={t("offers.empty")} text={t("offers.emptyText")}>
          <Link to="/offers/new" className="btn btn-primary">{t("offers.new")}</Link>
        </Empty>
      )}
      {data && data.length > 0 && (
        <div className="cards">
          {data.map((o) => (
            <Link key={o._id} to={`/offers/${o._id}`} className="card offer-card">
              <div className="lead-title">{o.title}</div>
              <div className="muted">
                {(o.targetCities?.length ? o.targetCities : [o.targetCity]).filter(Boolean).join(", ")} · {o.targetCountry}
              </div>
              <div className="tags">
                {o.targetCategories.map((c) => <span key={c} className="tag tag-plain">{c}</span>)}
              </div>
              {o.priceOnQuote ? <div className="price">{t("newOffer.onQuote")}</div> : o.price > 0 && <div className="price">{money(o.price, o.currency, lang)}</div>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
