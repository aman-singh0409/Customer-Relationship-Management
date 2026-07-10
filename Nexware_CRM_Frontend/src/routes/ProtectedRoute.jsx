import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);

  if (!user || !user.token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
