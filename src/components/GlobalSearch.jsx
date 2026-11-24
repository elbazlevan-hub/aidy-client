import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import { joinMeta, realCity } from "../utils/format.js";

// barre de recherche : retrouver vite un commerce débloqué (nom, téléphone, email, Instagram), dans toutes les offres
export default function GlobalSearch({ className = "", offerId }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null); // null = rien cherché
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef(null);

  // on cherche 250 ms après la dernière touche (pas à chaque lettre)
  useEffect(() => {
    const text = q.trim();
    if (text.length < 2) return setResults(null);
    let cancelled = false;
    const timer = setTimeout(() => {
      api
        .get(`/leads/search?q=${encodeURIComponent(text)}${offerId ? `&offerId=${offerId}` : ""}`)
        .then((r) => !cancelled && (setResults(r), setActive(0)))
        .catch(() => !cancelled && setResults([]));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q, offerId]);

  // clic en dehors : on ferme la liste
  useEffect(() => {
    const close = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function go(lead) {
    setOpen(false);
    setQ("");
    navigate(`/leads/${lead._id}`);
  }

  function onKey(e) {
    if (!results?.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter") { e.preventDefault(); go(results[active]); }
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <div className={`global-search ${className}`} ref={box}>
      <input
        type="search"
        value={q}
        placeholder={t("search.placeholder")}
        aria-label={t("search.placeholder")}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
      />
      {open && results && (
        <div className="search-results" role="listbox">
          {results.length === 0 ? (
            <p className="muted small search-empty">{t("search.none")}</p>
          ) : (
            results.map((r, i) => (
              <button
                key={r._id}
                type="button"
                role="option"
                aria-selected={i === active}
                className={`search-item${i === active ? " active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r)}
              >
                <span className="search-name" dir="auto">{r.name}</span>
                <span className={`badge badge-${r.status}`}>{t(`status.${r.status}`)}</span>
                <span className="search-meta muted small" dir="auto">{joinMeta(r.category, realCity(r.city), offerId ? "" : r.offerTitle)}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
