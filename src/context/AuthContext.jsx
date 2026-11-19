import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api.js";

const AuthContext = createContext(null);

// l'utilisateur connecté, partagé par toute l'application
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // au chargement : le cookie est-il encore valide ?
  useEffect(() => {
    api
      .get("/auth/me")
      .then((data) => setUser(data.user || data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await api.post("/auth/login", { email, password });
    setUser(data.user);
  }

  async function register(values) {
    const data = await api.post("/auth/register", values);
    setUser(data.user);
    return data; // { user, trialGiven }
  }

  async function logout() {
    await api.post("/auth/logout").catch(() => {});
    setUser(null);
  }

  // recharge l'utilisateur (crédits, formule...) après une action
  async function refresh() {
    const data = await api.get("/auth/me").catch(() => null);
    if (data) setUser(data.user || data);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
