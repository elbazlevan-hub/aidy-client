import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import { ErrorBox } from "../components/States.jsx";
import Logo from "../components/Logo.jsx";
import LangSwitch from "../components/LangSwitch.jsx";
import { Field } from "./AuthPages.jsx";
import { isEmail, isStrongPassword } from "../utils/validate.js";

// /forgot-password : on demande un lien par email
export function ForgotPassword() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!isEmail(email)) return setError(t("auth.errEmail"));
    setBusy(true);
    setServerError(null);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch (err) {
      setServerError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <LangSwitch className="auth-top" />
      <form className="card auth-card" onSubmit={onSubmit} noValidate>
        <Logo to="/" />
        <h1>{t("auth.forgotTitle")}</h1>
        {sent ? (
          <div className="alert alert-success" role="status"><span>{t("auth.forgotSent")}</span></div>
        ) : (
          <>
            <p className="muted">{t("auth.forgotText")}</p>
            <ErrorBox error={serverError} />
            <Field label={t("auth.email")} type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} error={error} autoComplete="email" />
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? t("common.loading") : t("auth.forgotSubmit")}</button>
          </>
        )}
        <p className="muted center"><Link to="/login">{t("auth.backToLogin")}</Link></p>
      </form>
    </div>
  );
}

// /reset-password?token=... : on choisit un nouveau mot de passe
export function ResetPassword() {
  const { t } = useI18n();
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [values, setValues] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => {
    setValues({ ...values, [key]: e.target.value });
    setErrors({ ...errors, [key]: undefined });
  };

  async function onSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!isStrongPassword(values.password)) errs.password = t("auth.errPassword");
    if (values.confirm !== values.password) errs.confirm = t("auth.errConfirm");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setServerError(null);
    try {
      await api.post("/auth/reset-password", { token, password: values.password });
      await refresh(); // le serveur a connecté l'utilisateur
      navigate("/today");
    } catch (err) {
      setServerError(err.status === 400 && !err.data?.errors ? new Error(t("auth.resetInvalid")) : err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <LangSwitch className="auth-top" />
      <form className="card auth-card" onSubmit={onSubmit} noValidate>
        <Logo to="/" />
        <h1>{t("auth.resetTitle")}</h1>
        {!token ? (
          <div className="alert alert-error"><span>{t("auth.resetInvalid")}</span></div>
        ) : (
          <>
            <ErrorBox error={serverError} />
            <Field label={t("auth.newPassword")} type="password" value={values.password} onChange={set("password")} error={errors.password} hint={t("auth.passwordHint")} autoComplete="new-password" />
            <Field label={t("auth.confirmPassword")} type="password" value={values.confirm} onChange={set("confirm")} error={errors.confirm} autoComplete="new-password" />
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? t("common.loading") : t("auth.resetSubmit")}</button>
          </>
        )}
        <p className="muted center"><Link to="/forgot-password">{t("auth.askNewLink")}</Link></p>
      </form>
    </div>
  );
}
