import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-overline animate-pulse">Loading</div>
      </div>
    );
  }
  if (!user || user === false) {
    return <Navigate to={requireAdmin ? "/admin/login" : "/login"} state={{ from: location.pathname }} replace />;
  }
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }
  if (!requireAdmin && user.role === "admin") {
    // Admin should not roam in user-only protected routes (account)
    return <Navigate to="/admin" replace />;
  }
  return children;
}
