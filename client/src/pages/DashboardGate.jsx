import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardGate() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = user.role === "admin" || user.role === "superadmin";
  return <Navigate to={isAdmin ? "/admin" : "/dashboard/player"} replace />;
}
