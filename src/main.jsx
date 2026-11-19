import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
// polices installées avec npm (pas besoin de Google Fonts)
import "@fontsource-variable/geist";
import "@fontsource-variable/bricolage-grotesque";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
