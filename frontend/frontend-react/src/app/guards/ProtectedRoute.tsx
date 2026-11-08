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
    const { isAuthenticated, user, mustChangePassword } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // intercepta operadores que necessitam cadastrar nova senha pessoal no primeiro acesso
    if (mustChangePassword) {
        if (location.pathname !== '/primeiro-acesso' && location.pathname !== '/auth/primeiro-acesso') {
            return <Navigate to="/primeiro-acesso" replace />;
        }
    } else if (location.pathname === '/primeiro-acesso' || location.pathname === '/auth/primeiro-acesso') {
        return <Navigate to="/dashboard" replace />;
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
    const { isAuthenticated, mustChangePassword } = useAuth();

    if (isAuthenticated) {
        if (mustChangePassword) {
            return <Navigate to="/primeiro-acesso" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
}
