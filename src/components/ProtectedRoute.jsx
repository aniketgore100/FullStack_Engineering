import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CoursesProvider } from "../context/CoursesContext";

const Splash = () => (
  <div className="bg-dots grid h-dvh place-items-center">
    <Loader2 size={20} className="animate-spin text-zinc-400" />
  </div>
);

// pages that need a logged-in user
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <Splash />;
  if (status === "guest") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return (
    <CoursesProvider>
      <Outlet />
    </CoursesProvider>
  );
}

// login / register: bounce logged-in users to the app
export function GuestRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <Splash />;
  if (status === "authed") {
    return <Navigate to={location.state?.from?.pathname ?? "/"} replace />;
  }
  return <Outlet />;
}
