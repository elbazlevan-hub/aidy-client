import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import Logo from "./Logo.jsx";
import Icon from "./Icon.jsx";

const LINKS = [
  { to: "/today", key: "nav.today", icon: "today" },
  { to: "/offers", key: "nav.offers", icon: "offers" },
  { to: "/inbox", key: "nav.inbox", icon: "inbox" },
  { to: "/stats", key: "nav.stats", icon: "stats" },
  { to: "/packs", key: "nav.packs", icon: "packs" },
  { to: "/guide", key: "nav.guide", icon: "guide" },
  { to: "/settings", key: "nav.settings", icon: "settings" },
];

// structure des pages connectées : menu à gauche (en bas sur téléphone) + contenu
export default function Layout() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    setBusy(true);
    await logout();
    navigate("/");
  }

  const unlimited = user?.role === "admin";
  const credits = (
    <Link to="/packs" className="credit-link" title={t("nav.buyCredits")}>
      {user?.plan === "premium" && <span className="plan-star" aria-hidden="true">★</span>}
      {unlimited ? "∞" : t("nav.credits", { n: user?.credits ?? 0 })}
      {!unlimited && user?.jobCredits > 0 && <span className="small"> · {t("nav.jobCredits", { n: user.jobCredits })}</span>}
      <span className="credit-plus" aria-hidden="true">+</span>
    </Link>
  );

  return (
    <div className="app">
      {/* barre du haut, seulement sur téléphone */}
      <header className="mobile-top">
        <Logo height={22} />
        <div className="mobile-top-right">
          {credits}
        </div>
      </header>

      <aside className="sidebar">
        <Logo />
        <nav className="nav">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              <span className="nav-icon"><Icon name={l.icon} /></span>
              <span className="nav-label">{t(l.key)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar" aria-hidden="true">{(user?.name || "?").slice(0, 1).toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-plan">{credits}</div>
            </div>
            <button className="icon-btn" onClick={onLogout} disabled={busy} title={t("nav.logout")} aria-label={t("nav.logout")}>
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main">
        {/* petite apparition à chaque changement de page */}
        <div key={location.pathname} className="route-fade">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
