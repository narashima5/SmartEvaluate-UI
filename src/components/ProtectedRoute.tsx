import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
    const { token } = useAuth();

    // If there is no token, redirect to the login page immediately
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Attempt to render the child routes (e.g., <Layout /> and its nested pages)
    return <Outlet />;
}
