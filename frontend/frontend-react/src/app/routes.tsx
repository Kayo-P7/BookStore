import * as React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute, PublicRoute } from './guards/ProtectedRoute';

function lazyNamed<K extends string, T extends Record<K, React.ComponentType>>(
    loader: () => Promise<T>,
    exportName: K
) {
    return React.lazy(() => loader().then(module => ({ default: module[exportName] })));
}

const DashboardPage = lazyNamed(() => import('../modules/dashboard/DashboardPage'), 'DashboardPage');
const BooksPage = lazyNamed(() => import('../modules/books/BooksPage'), 'BooksPage');
const CustomersPage = lazyNamed(() => import('../modules/customers/CustomersPage'), 'CustomersPage');
const SalesPage = lazyNamed(() => import('../modules/sales/SalesPage'), 'SalesPage');
const LoansPage = lazyNamed(() => import('../modules/loans/LoansPage'), 'LoansPage');
const ServicesPage = lazyNamed(() => import('../modules/services/ServicesPage'), 'ServicesPage');
const SettingsPage = lazyNamed(() => import('../modules/settings/SettingsPage'), 'SettingsPage');
const UsersPage = lazyNamed(() => import('../modules/users/UsersPage'), 'UsersPage');
const LoginPage = lazyNamed(() => import('../modules/auth/LoginPage'), 'LoginPage');
const PrimeiroAcessoPage = lazyNamed(() => import('../modules/auth/PrimeiroAcessoPage'), 'PrimeiroAcessoPage');
const NotFoundPage = lazyNamed(() => import('../modules/not-found/NotFoundPage'), 'NotFoundPage');

function RouteFallback() {
    return (
        <div className="flex items-center justify-center py-12 text-xs text-muted-foreground">
            Carregando módulo...
        </div>
    );
}

export function AppRoutes() {
    return (
        <React.Suspense fallback={<RouteFallback />}>
            <Routes>
                {/* layout de autenticacao com redirecionamento para dashboard se ja autenticado */}
                <Route path="/auth" element={
                    <PublicRoute>
                        <AuthLayout />
                    </PublicRoute>
                }>
                    <Route path="login" element={<LoginPage />} />
                    <Route path="forgot-password" element={<Navigate to="/auth/login" replace />} />
                    <Route index element={<Navigate to="/auth/login" replace />} />
                </Route>

                {/* rota de primeiro acesso para troca obrigatoria de senha */}
                <Route path="/primeiro-acesso" element={
                    <ProtectedRoute>
                        <PrimeiroAcessoPage />
                    </ProtectedRoute>
                } />
                <Route path="/auth/primeiro-acesso" element={<Navigate to="/primeiro-acesso" replace />} />

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
                    <Route path="loans" element={<LoansPage />} />
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
        </React.Suspense>
    );
}
