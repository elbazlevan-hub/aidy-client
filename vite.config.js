import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// /api est redirigé vers le serveur Express : le cookie du token marche sans souci de CORS
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:3000",
    },
  },
});
