import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { user } = useAuth();

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = user.role === "admin" || user.role === "superadmin";
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
