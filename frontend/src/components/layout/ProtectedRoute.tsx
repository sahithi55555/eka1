import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authService } from "../../features/auth/services/authService";

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;
        authService.getCurrentUser()
            .then((user) => {
                if (isMounted) {
                    setRole(user.role);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setRole(null);
                    setLoading(false);
                }
            });
        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!role) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};
