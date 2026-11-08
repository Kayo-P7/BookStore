import * as React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute, PublicRoute } from './guards/ProtectedRoute';
import { DashboardPage } from '../modules/dashboard/DashboardPage';
import { BooksPage } from '../modules/books/BooksPage';
import { CustomersPage } from '../modules/customers/CustomersPage';
import { SalesPage } from '../modules/sales/SalesPage';
import { ServicesPage } from '../modules/services/ServicesPage';
import { SettingsPage } from '../modules/settings/SettingsPage';
import { UsersPage } from '../modules/users/UsersPage';
import { LoginPage } from '../modules/auth/LoginPage';
import { ForgotPasswordPage } from '../modules/auth/ForgotPasswordPage';
import { NotFoundPage } from '../modules/not-found/NotFoundPage';

export function AppRoutes() {
    return (
        <Routes>
            {/* layout de autenticacao com redirecionamento para dashboard se ja autenticado */}
            <Route path="/auth" element={
                <PublicRoute>
                    <AuthLayout />
                </PublicRoute>
            }>
                <Route path="login" element={<LoginPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route index element={<Navigate to="/auth/login" replace />} />
            </Route>

            {/* layout autenticado principal protegido por sessao */}
            <Route path="/" element={
                <ProtectedRoute>
                    <AppLayout />
                </ProtectedRoute>
            }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="catalog" element={<BooksPage />} />
                <Route path="books" element={<Navigate to="/catalog" replace />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="sales" element={<SalesPage />} />
                <Route path="logistics" element={<ServicesPage />} />
                <Route path="services" element={<Navigate to="/logistics" replace />} />
                <Route path="users" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <UsersPage />
                    </ProtectedRoute>
                } />
                <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* rota explicita de 404 e captura de qualquer rota nao mapeada */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
