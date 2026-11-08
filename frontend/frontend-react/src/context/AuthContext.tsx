import * as React from 'react';
import { authService } from '../services/authService';
import { UserRole } from '../types';

export interface AuthUser {
    userId: number;
    name: string;
    email: string;
    role: UserRole;
}

export interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isSeller: boolean;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: () => void;
    hasRole: (role: UserRole) => boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'bookstore_token';
const USER_KEY = 'bookstore_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = React.useState<string | null>(() => {
        if (typeof localStorage === 'undefined') return null;
        return localStorage.getItem(TOKEN_KEY);
    });

    const [user, setUser] = React.useState<AuthUser | null>(() => {
        if (typeof localStorage === 'undefined') return null;
        const stored = localStorage.getItem(USER_KEY);
        if (!stored) return null;
        try {
            return JSON.parse(stored) as AuthUser;
        } catch {
            return null;
        }
    });

    const login = React.useCallback(async (credentials: { email: string; password: string }) => {
        const response = await authService.login(credentials);
        if (!response || !response.accessToken) {
            throw new Error('Falha na autenticação: token não retornado pelo servidor.');
        }

        const normalizedRole = (
            response.role ? response.role.replace('ROLE_', '').toUpperCase() : 'SELLER'
        ) as UserRole;

        const authUser: AuthUser = {
            userId: response.userId,
            name: response.name,
            email: response.email,
            role: normalizedRole
        };

        localStorage.setItem(TOKEN_KEY, response.accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(authUser));

        setToken(response.accessToken);
        setUser(authUser);
    }, []);

    const logout = React.useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
    }, []);

    const hasRole = React.useCallback((role: UserRole) => {
        return user?.role === role;
    }, [user?.role]);

    const isAuthenticated = Boolean(token && user);
    const isAdmin = user?.role === 'ADMIN';
    const isSeller = user?.role === 'SELLER';

    const value = React.useMemo<AuthContextType>(() => ({
        user,
        token,
        isAuthenticated,
        isAdmin,
        isSeller,
        login,
        logout,
        hasRole
    }), [user, token, isAuthenticated, isAdmin, isSeller, login, logout, hasRole]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
    }
    return context;
}
