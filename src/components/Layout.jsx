import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import Logo from "./Logo.jsx";

const LINKS = [
  { to: "/today", key: "nav.today", icon: "☀️" },
  { to: "/offers", key: "nav.offers", icon: "🎯" },
  { to: "/inbox", key: "nav.inbox", icon: "💬" },
  { to: "/stats", key: "nav.stats", icon: "📈" },
  { to: "/packs", key: "nav.packs", icon: "💎" },
  { to: "/settings", key: "nav.settings", icon: "⚙️" },
];

// structure des pages connectées : menu à gauche (en bas sur téléphone) + contenu
export default function Layout() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    setBusy(true);
    await logout();
    navigate("/");
  }

  const unlimited = user?.role === "admin";
  return (
    <div className="app">
      <aside className="sidebar">
        <Logo />
        <nav className="nav">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              <span className="nav-icon" aria-hidden="true">{l.icon}</span>
              <span className="nav-label">{t(l.key)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar" aria-hidden="true">{(user?.name || "?").slice(0, 1).toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              {/* le compteur de crédits mène à la page des packs */}
              <Link to="/packs" className="user-plan credit-link" title={t("nav.buyCredits")}>
                {user?.plan === "premium" && "⭐ "}
                {unlimited ? "∞" : t("nav.credits", { n: user?.credits ?? 0 })} · <span className="credit-plus">+</span>
              </Link>
            </div>
          </div>
          <button className="btn btn-ghost btn-small" onClick={onLogout} disabled={busy}>
            {t("nav.logout")}
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
