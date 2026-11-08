import * as React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
    children?: React.ReactNode;
    allowedRoles?: UserRole[];
}

// guarda de rotas que restringe acesso apenas a operadores autenticados com permissoes validas
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user) {
        const normalizedUserRole = user.role.replace('ROLE_', '').toUpperCase();
        const normalizedAllowed = allowedRoles.map(r => r.replace('ROLE_', '').toUpperCase());
        if (!normalizedAllowed.includes(normalizedUserRole)) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children ? <>{children}</> : <Outlet />;
}

// guarda que redireciona usuarios ja autenticados para fora das telas de login
export function PublicRoute({ children }: { children?: React.ReactNode }) {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
}
