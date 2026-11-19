import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { Loader } from "./States.jsx";

// les pages de l'app : seulement si connecté, sinon -> /login
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
