import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { api } from "../api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import { useApi } from "../utils/useApi.js";
import { ErrorBox, Loader } from "../components/States.jsx";
import { splitList } from "../utils/format.js";
import { isCountry } from "../utils/validate.js";
import { CRITERIA, CURRENCIES, MESSAGE_LANGUAGES, COUNTRY_LANGUAGE, currencyLabel } from "../utils/constants.js";
import { countryList } from "../utils/countries.js";
import CityPicker from "../components/CityPicker.jsx";

const EMPTY = {
  title: "", description: "", serviceType: "", categories: "", country: "", cities: "",
  criteria: [], customCriterion: "", messageLanguage: "fr", price: "", priceOnQuote: false, currency: "USD",
  dailyLimit: 60, includeLandlines: false,
};

function CountrySelect({ value, onChange, countries, invalid, placeholder }) {
  return (
    <select value={value} onChange={onChange} className={invalid ? "invalid" : ""}>
      <option value="">{placeholder}</option>
      {countries.map((c) => (
        <option key={c.code} value={c.code}>{c.name}</option>
      ))}
    </select>
  );
}

// 3 façons de créer une offre : AIDY à partir d'un texte, un modèle, ou tout remplir
// sans :id -> création ; avec :id (/offers/:id/edit) -> modification
export default function NewOffer() {
  const { id: editId } = useParams();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const templates = useApi("/offers/templates");
  const [mode, setMode] = useState("ai");
  const [form, setForm] = useState({ ...EMPTY, messageLanguage: lang });
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const countries = countryList(lang);

  // modification : on charge l'offre et on remplit le formulaire
  useEffect(() => {
    if (!editId) return;
    setMode("manual");
    setShowForm(true);
    api
      .get(`/offers/${editId}`)
      .then(({ offer: o }) =>
        setForm({
          title: o.title || "",
          description: o.description || "",
          serviceType: o.serviceType || "",
          categories: (o.targetCategories || []).join(", "),
          country: o.targetCountry || "",
          cities: (o.targetCities?.length ? o.targetCities : [o.targetCity]).filter(Boolean).join(", "),
          criteria: o.criteria || [],
          customCriterion: o.customCriterion || "",
          messageLanguage: o.messageLanguage || "fr",
          price: o.price || "",
          priceOnQuote: Boolean(o.priceOnQuote),
          currency: o.currency || "USD",
          dailyLimit: o.dailyLimit || 60,
          includeLandlines: Boolean(o.includeLandlines),
        })
      )
      .catch(setError);
  }, [editId]);

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    // en choisissant le pays, on propose la langue des messages qui va avec
    if (key === "country" && COUNTRY_LANGUAGE[value]) {
      setForm({ ...form, country: value, messageLanguage: COUNTRY_LANGUAGE[value] });
      setErrors({ ...errors, country: undefined });
      return;
    }
    setForm({ ...form, [key]: value });
    setErrors({ ...errors, [key]: undefined });
  };

  function fill(o) {
    setForm({
      ...form,
      title: o.title || "",
      description: o.description || "",
      serviceType: o.serviceType || "",
      categories: (o.targetCategories || []).join(", "),
      criteria: o.criteria || [],
      customCriterion: o.customCriterion || "",
      messageLanguage: o.messageLanguage || form.messageLanguage,
      country: o.targetCountry || form.country,
      cities: (o.targetCities || []).join(", ") || form.cities,
    });
    setShowForm(true);
  }

  async function suggest() {
    if (text.trim().length < 15) {
      setErrors({ text: t("newOffer.describeError") });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const country = isCountry(form.country) ? form.country.toUpperCase() : undefined;
      fill(await api.post("/offers/suggest", { text: text.trim(), language: lang, country, city: splitList(form.cities)[0] }));
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  function toggleCriterion(c) {
    const has = form.criteria.includes(c);
    setForm({ ...form, criteria: has ? form.criteria.filter((x) => x !== c) : [...form.criteria, c] });
    setErrors({ ...errors, criteria: undefined });
  }

  function validate() {
    const e = {};
    const categories = splitList(form.categories);
    const cities = splitList(form.cities);
    if (form.title.trim().length < 3) e.title = t("newOffer.errTitle");
    if (form.serviceType.trim().length < 2) e.serviceType = t("auth.errRequired");
    if (categories.length === 0) e.categories = t("newOffer.errCategories");
    if (!isCountry(form.country)) e.country = t("newOffer.errCountry");
    if (form.criteria.length === 0) e.criteria = t("newOffer.errCriteria");
    if (!form.priceOnQuote && form.price !== "" && !(Number(form.price) >= 0)) e.price = t("newOffer.errPrice");
    if ((cities.length || 1) * categories.length > 20) e.cities = t("newOffer.errTooMany");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function create(e) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setError(null);
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        serviceType: form.serviceType.trim(),
        targetCategories: splitList(form.categories),
        targetCountry: form.country.trim().toUpperCase(),
        targetCities: splitList(form.cities),
        criteria: form.criteria,
        customCriterion: form.customCriterion.trim().length >= 5 ? form.customCriterion.trim() : undefined,
        messageLanguage: form.messageLanguage,
        price: form.priceOnQuote ? 0 : Number(form.price) || 0,
        priceOnQuote: form.priceOnQuote,
        currency: form.currency,
        dailyLimit: Number(form.dailyLimit) || 60,
        includeLandlines: form.includeLandlines,
      };
      const offer = editId ? await api.put(`/offers/${editId}`, body) : await api.post("/offers", body);
      // nouvelle offre : on lance directement la recherche de clients
      navigate(editId ? `/offers/${offer._id}` : `/offers/${offer._id}?start=1`);
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  }

  return (
    <div className="page narrow">
      <h1>{t(editId ? "newOffer.editTitle" : "newOffer.title")}</h1>
      {!editId && <div className="tabs" role="tablist">
        {["ai", "template", "manual"].map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            className={`tab${mode === m ? " active" : ""}`}
            onClick={() => {
              setMode(m);
              if (m === "manual") setShowForm(true);
            }}
          >
            {t(m === "ai" ? "newOffer.modeAi" : m === "template" ? "newOffer.modeTemplate" : "newOffer.modeManual")}
          </button>
        ))}
      </div>}

      <ErrorBox error={error} />

      {mode === "ai" && (
        <div className="card">
          <label className="field">
            <span>{t("newOffer.describe")}</span>
            <textarea rows={4} value={text} placeholder={t("newOffer.describePlaceholder")} onChange={(e) => { setText(e.target.value); setErrors({}); }} className={errors.text ? "invalid" : ""} />
            {errors.text && <small className="field-error">{errors.text}</small>}
          </label>
          <div className="grid-2">
            <label className="field">
              <span>{t("newOffer.fieldCountry")}</span>
              <CountrySelect value={form.country} onChange={set("country")} countries={countries} placeholder="—" />
            </label>
            <CityPicker value={form.cities} onChange={(v) => setForm({ ...form, cities: v })} />
          </div>
          <button className="btn btn-primary" onClick={suggest} disabled={busy}>
            {busy ? t("newOffer.generating") : t("newOffer.generate")}
          </button>
        </div>
      )}

      {mode === "template" && (
        <>
          {templates.loading && <Loader />}
          <ErrorBox error={templates.error} onRetry={templates.reload} />
          <div className="cards">
            {templates.data?.map((tpl) => (
              <button key={tpl.id} className="card template" onClick={() => fill(tpl)}>
                <div className="lead-title">{tpl.name}</div>
                <p className="muted">{tpl.description}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <form className="card form" onSubmit={create} noValidate>
          {mode !== "manual" && <p className="hint success">{t("newOffer.check")}</p>}
          <label className="field">
            <span>{t("newOffer.fieldTitle")}</span>
            <input value={form.title} onChange={set("title")} className={errors.title ? "invalid" : ""} />
            {errors.title && <small className="field-error">{errors.title}</small>}
          </label>
          <label className="field">
            <span>{t("newOffer.fieldDescription")} <em className="muted">({t("common.optional")})</em></span>
            <textarea rows={2} value={form.description} onChange={set("description")} />
          </label>
          <div className="grid-2">
            <label className="field">
              <span>{t("newOffer.fieldService")}</span>
              <input value={form.serviceType} onChange={set("serviceType")} className={errors.serviceType ? "invalid" : ""} />
              {errors.serviceType && <small className="field-error">{errors.serviceType}</small>}
            </label>
            <label className="field">
              <span>{t("newOffer.fieldCategories")}</span>
              <input value={form.categories} onChange={set("categories")} className={errors.categories ? "invalid" : ""} />
              <small className={errors.categories ? "field-error" : "muted"}>{errors.categories || t("newOffer.categoriesHint")}</small>
            </label>
            <label className="field">
              <span>{t("newOffer.fieldCountry")}</span>
              <CountrySelect value={form.country} onChange={set("country")} countries={countries} invalid={!!errors.country} placeholder="—" />
              {errors.country && <small className="field-error">{errors.country}</small>}
            </label>
            <CityPicker value={form.cities} onChange={(v) => { setForm({ ...form, cities: v }); setErrors({ ...errors, cities: undefined }); }} error={errors.cities} />
          </div>

          <fieldset className="field">
            <legend>{t("newOffer.fieldCriteria")}</legend>
            <div className="chips">
              {CRITERIA.map((c) => (
                <button type="button" key={c} className={`chip${form.criteria.includes(c) ? " on" : ""}`} onClick={() => toggleCriterion(c)} aria-pressed={form.criteria.includes(c)}>
                  {t(`reasons.${c}`)}
                </button>
              ))}
            </div>
            {errors.criteria && <small className="field-error">{errors.criteria}</small>}
          </fieldset>

          <label className="field">
            <span>{t("newOffer.fieldCustom")} <em className="muted">({t("common.optional")})</em></span>
            <input value={form.customCriterion} onChange={set("customCriterion")} placeholder={t("newOffer.customPlaceholder")} />
            <small className="muted">{t("newOffer.customHint")}</small>
          </label>

          <div className="grid-3">
            <label className="field">
              <span>{t("newOffer.fieldLanguage")}</span>
              <select value={form.messageLanguage} onChange={set("messageLanguage")}>
                {MESSAGE_LANGUAGES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
              </select>
              <small className="muted">{t("newOffer.languageHint")}</small>
            </label>
            <label className="field">
              <span>{t("newOffer.fieldPrice")}</span>
              <input type="number" min="0" value={form.priceOnQuote ? "" : form.price} onChange={set("price")} disabled={form.priceOnQuote} className={errors.price ? "invalid" : ""} />
              <label className="check small">
                <input type="checkbox" checked={form.priceOnQuote} onChange={set("priceOnQuote")} />
                <span>{t("newOffer.onQuote")}</span>
              </label>
              {errors.price && <small className="field-error">{errors.price}</small>}
            </label>
            <label className="field">
              <span>{t("newOffer.fieldCurrency")}</span>
              <select value={form.currency} onChange={set("currency")}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{currencyLabel(c, lang)}</option>)}
              </select>
            </label>
          </div>
          <div className="grid-2">
            <label className="field">
              <span>{t("newOffer.fieldDailyLimit")}</span>
              <input type="number" min="1" max="200" value={form.dailyLimit} onChange={set("dailyLimit")} />
              <small className="muted">{t("newOffer.dailyLimitHint")}</small>
            </label>
            <label className="check">
              <input type="checkbox" checked={form.includeLandlines} onChange={set("includeLandlines")} />
              <span>{t("newOffer.fieldLandlines")}</span>
            </label>
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? t("common.loading") : t(editId ? "common.save" : "newOffer.create")}
          </button>
        </form>
      )}
    </div>
  );
}
