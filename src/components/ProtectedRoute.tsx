import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { token, user } = useAuth();

  // If there is no token, redirect to the login page immediately
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If user is not approved, redirect to home page where the pending screen is rendered
  if (user && user.isApproved === false) {
    return <Navigate to="/" replace />;
  }

  // If role is not allowed, redirect to home page
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Attempt to render the child routes (e.g., <Layout /> and its nested pages)
  return <Outlet />;
}
