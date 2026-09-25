import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function FullScreenLoader() {
  return (
    <div className="grid h-dvh place-items-center bg-cream">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-brand"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  return user ? <Outlet /> : <Navigate to="/" replace />;
}
