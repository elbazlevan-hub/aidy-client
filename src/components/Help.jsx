import { useId, useState } from "react";

// petite bulle « i » : explique un bouton ou un champ (survol, clic ou clavier)
export default function Help({ text }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span className={`help${open ? " open" : ""}`} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="help-btn"
        aria-label={text}
        aria-describedby={id}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); }}
        onBlur={() => setOpen(false)}
      >
        i
      </button>
      <span role="tooltip" id={id} className="help-tip">{text}</span>
    </span>
  );
}

// une explication sous un champ à remplir
export function FieldHelp({ children }) {
  return <small className="field-help">{children}</small>;
}
