import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import { ErrorBox } from "../components/States.jsx";
import Logo from "../components/Logo.jsx";
import LangSwitch from "../components/LangSwitch.jsx";
import { isDisposableEmail, isEmail, isStrongPassword } from "../utils/validate.js";

// un champ de formulaire ; pour un mot de passe, un petit œil permet de l'afficher
export function Field({ label, error, hint, extra, ...props }) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  const isPassword = props.type === "password";
  return (
    <label className="field">
      <span className="field-label-row">{label}{extra}</span>
      <span className={isPassword ? "password-wrap" : undefined}>
        <input {...props} type={isPassword && show ? "text" : props.type} className={error ? "invalid" : ""} />
        {isPassword && (
          <button type="button" className="eye-btn" onClick={() => setShow(!show)} aria-label={t(show ? "auth.hidePassword" : "auth.showPassword")} title={t(show ? "auth.hidePassword" : "auth.showPassword")}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
              {show && <path d="M3 3l18 18" />}
            </svg>
          </button>
        )}
      </span>
      {error ? <small className="field-error">{error}</small> : hint && <small className="muted">{hint}</small>}
    </label>
  );
}

// connexion et inscription : même formulaire, champ "nom" en plus pour l'inscription
function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const { user, login, register } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/today" replace />;

  const set = (key) => (e) => {
    setValues({ ...values, [key]: e.target.value });
    setErrors({ ...errors, [key]: undefined });
  };

  function validate() {
    const e = {};
    if (isRegister && values.name.trim().length < 2) e.name = t("auth.errName");
    if (!isEmail(values.email)) e.email = t("auth.errEmail");
    else if (isRegister && isDisposableEmail(values.email)) e.email = t("auth.errDisposable");
    if (isRegister && !isStrongPassword(values.password)) e.password = t("auth.errPassword");
    if (!isRegister && !values.password) e.password = t("auth.errRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setBusy(true);
    try {
      if (isRegister) {
        const data = await register({ name: values.name.trim(), email: values.email.trim(), password: values.password, language: lang });
        // essai gratuit déjà utilisé (même boîte mail ou même connexion) : on l'envoie vers les packs
        navigate(data.trialGiven === false ? "/packs" : "/today");
        return;
      }
      await login(values.email.trim(), values.password);
      navigate("/today");
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
        <h1>{t(isRegister ? "auth.registerTitle" : "auth.loginTitle")}</h1>
        <p className="muted">{t(isRegister ? "auth.registerSubtitle" : "auth.loginSubtitle")}</p>
        <ErrorBox error={serverError} />
        {isRegister && <Field label={t("auth.name")} value={values.name} onChange={set("name")} error={errors.name} autoComplete="name" />}
        <Field label={t("auth.email")} type="email" value={values.email} onChange={set("email")} error={errors.email} autoComplete="email" />
        <Field
          label={t("auth.password")}
          type="password"
          value={values.password}
          onChange={set("password")}
          error={errors.password}
          hint={isRegister ? t("auth.passwordHint") : ""}
          autoComplete={isRegister ? "new-password" : "current-password"}
          extra={!isRegister && <Link to="/forgot-password" className="forgot-link">{t("auth.forgot")}</Link>}
        />
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? t("common.loading") : t(isRegister ? "auth.submitRegister" : "auth.submitLogin")}
        </button>
        <p className="muted center">
          {t(isRegister ? "auth.hasAccount" : "auth.noAccount")}{" "}
          <Link to={isRegister ? "/login" : "/register"}>{t(isRegister ? "auth.submitLogin" : "auth.submitRegister")}</Link>
        </p>
      </form>
    </div>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
