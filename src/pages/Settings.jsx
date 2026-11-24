import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import LangSwitch from "../components/LangSwitch.jsx";
import { WORLD_LANGUAGE_CODES, nativeName, localName } from "../i18n/worldLanguages.js";
import Help, { FieldHelp } from "../components/Help.jsx";
import PremiumBadge from "../components/PremiumBadge.jsx";
import { useApi } from "../utils/useApi.js";
import { ErrorBox, Loader } from "../components/States.jsx";
import { isUrlOrEmpty } from "../utils/validate.js";
import { day } from "../utils/format.js";

const FIELDS = [
  ["signature", "settings.signaturePlaceholder"],
  ["priceInfo", "settings.pricePlaceholder"],
  ["deliveryTime", "settings.deliveryPlaceholder"],
  ["portfolioUrl", null],
  ["bookingUrl", null],
  ["guarantees", null],
];

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang, setLang, translating, translateError } = useI18n();
  const profile = useApi("/profile");
  const blocklist = useApi("/blocklist");
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (profile.data) setValues(profile.data.sellerProfile || {});
  }, [profile.data]);

  const set = (key) => (e) => {
    setValues({ ...values, [key]: e.target.value });
    setErrors({ ...errors, [key]: undefined });
    setSaved(false);
  };

  async function save(e) {
    e.preventDefault();
    const errs = {};
    for (const key of ["portfolioUrl", "bookingUrl"]) if (!isUrlOrEmpty(values[key])) errs[key] = t("settings.errUrl");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    setError(null);
    try {
      const body = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v ?? "").trim()]));
      await api.put("/profile", body);
      setSaved(true);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  async function unblock(id) {
    try {
      await api.del(`/blocklist/${id}`);
      blocklist.setData(blocklist.data.filter((b) => b._id !== id));
    } catch (err) {
      setError(err);
    }
  }

  const plan = user?.role === "admin" ? "premium" : user?.plan || "free";

  return (
    <div className="page narrow">
      <h1>{t("settings.title")}</h1>

      <section className="card">
        <h2>{t("settings.account")}</h2>
        <p>{user?.name} · {user?.email}</p>
        <p className="muted">{t("settings.plan")} : <strong>{t(`settings.plans.${plan}`)}</strong> · {t("nav.credits", { n: user?.credits ?? 0 })}</p>
        <Link className="btn btn-secondary btn-small" to="/packs">{t("nav.buyCredits")}</Link>
        <div className="field">
          <span>{t("settings.language")}</span>
          <LangSwitch className="lang-large" />
        </div>
        <label className="field">
          <span>{t("settings.otherLanguage")}</span>
          <select value={["en", "fr"].includes(lang) ? "" : lang} onChange={(e) => e.target.value && setLang(e.target.value)}>
            <option value="">{t("settings.chooseLanguage")}</option>
            {WORLD_LANGUAGE_CODES
              .map((code) => ({ code, native: nativeName(code), local: localName(code, lang) }))
              .sort((a, b) => a.native.localeCompare(b.native))
              .map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native}{l.local.toLowerCase() !== l.native.toLowerCase() ? ` (${l.local})` : ""}
                </option>
              ))}
          </select>
          <small className="muted">{t("settings.otherLanguageHint")}</small>
          {translating && <small className="muted" role="status">{t("settings.translating")}</small>}
          {translateError && <small className="danger" role="alert">{t("settings.translateError")}</small>}
        </label>
        <button className="btn btn-ghost btn-small" onClick={async () => { await logout(); navigate("/"); }}>
          {t("nav.logout")}
        </button>
      </section>

      <section className="card">
        <h2>{t("settings.profile")}</h2>
        <p className="muted">{t("settings.profileHint")}</p>
        <p className="muted small">{t("premium.profileNote")} <PremiumBadge /></p>
        {profile.loading && <Loader />}
        <ErrorBox error={profile.error || error} onRetry={profile.error ? profile.reload : undefined} />
        {profile.data && (
          <form onSubmit={save} noValidate>
            <label className="field">
              <span>{t("settings.contactPreference")}</span>
              <select value={values.contactPreference || "message"} onChange={set("contactPreference")}>
                {["message", "call", "either"].map((v) => <option key={v} value={v}>{t(`settings.contact.${v}`)}</option>)}
              </select>
              <FieldHelp>{t("help.contactPreference")}</FieldHelp>
            </label>
            {FIELDS.map(([key, placeholder]) => (
              <label key={key} className="field">
                <span>{t(`settings.${key}`)}</span>
                <input value={values[key] || ""} onChange={set(key)} placeholder={placeholder ? t(placeholder) : key.endsWith("Url") ? "https://" : ""} className={errors[key] ? "invalid" : ""} />
                {errors[key] ? <small className="field-error">{errors[key]}</small> : <FieldHelp>{t(`help.${key}`)}</FieldHelp>}
              </label>
            ))}
            <label className="field">
              <span>{t("settings.faq")}</span>
              <textarea rows={3} value={values.faq || ""} onChange={set("faq")} />
              <FieldHelp>{t("help.faq")}</FieldHelp>
            </label>
            <button className="btn btn-primary" disabled={saving}>{saved ? t("common.saved") : t("common.save")}</button>
          </form>
        )}
      </section>

      <section className="card">
        <h2>{t("settings.blocklist")}<Help text={t("help.blocklist")} /></h2>
        {blocklist.loading && <Loader />}
        <ErrorBox error={blocklist.error} onRetry={blocklist.reload} />
        {blocklist.data?.length === 0 && <p className="muted">{t("settings.blocklistEmpty")}</p>}
        <ul className="list">
          {blocklist.data?.map((b) => (
            <li key={b._id}>
              <div>
                <strong>{b.name}</strong>
                <div className="muted small">{b.reason} · {day(b.createdAt, lang)}</div>
              </div>
              <button className="btn btn-ghost btn-small" onClick={() => unblock(b._id)}>{t("settings.unblock")}</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
