import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    ShoppingBag,
    Layers,
    Settings,
    X
} from 'lucide-react';
import { cn } from './ui/button';

interface SidebarProps {
    collapsed: boolean;
    onToggleCollapse?: () => void;
    mobileOpen: boolean;
    onCloseMobile: () => void;
}

export function Sidebar({
    collapsed,
    mobileOpen,
    onCloseMobile
}: SidebarProps) {
    const navItems = [
        {
            to: '/dashboard',
            label: 'Dashboard',
            description: 'Visão geral e métricas',
            icon: LayoutDashboard
        },
        {
            to: '/books',
            label: 'Catálogo de Livros',
            description: 'Estoque e títulos',
            icon: BookOpen
        },
        {
            to: '/customers',
            label: 'Usuários & Clientes',
            description: 'Gestão e busca de CEP',
            icon: Users
        },
        {
            to: '/sales',
            label: 'Vendas & Pedidos',
            description: 'Registro e histórico',
            icon: ShoppingBag
        },
        {
            to: '/services',
            label: 'Serviços & Utilitários',
            description: 'Módulo Vue integrado',
            icon: Layers,
            badge: 'Vue 3'
        },
        {
            to: '/settings',
            label: 'Configurações',
            description: 'Status e diagnóstico',
            icon: Settings
        }
    ];

    return (
        <>
            {/* desktop sidebar retratil */}
            <aside
                className={cn(
                    'hidden md:flex flex-col fixed top-16 bottom-0 left-0 z-30 glass-sidebar transition-all duration-300 ease-in-out',
                    collapsed ? 'w-20' : 'w-72'
                )}
            >
                {/* navegacao principal */}
                <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5">
                    {!collapsed && (
                        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase font-mono">
                            Menu Principal
                        </div>
                    )}

                    {navItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    cn(
                                        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                                        isActive
                                            ? 'bg-primary/15 text-primary font-semibold shadow-sm border border-primary/20'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
                                        collapsed && 'justify-center px-0'
                                    )
                                }
                                title={collapsed ? `${item.label} — ${item.description}` : undefined}
                            >
                                <Icon className={cn('w-5 h-5 shrink-0 transition-transform group-hover:scale-110 duration-200')} />

                                {!collapsed && (
                                    <div className="flex-1 flex items-center justify-between min-w-0">
                                        <div className="truncate">
                                            <div className="text-sm font-medium leading-tight truncate">{item.label}</div>
                                            <div className="text-[11px] text-muted-foreground/80 leading-tight truncate">{item.description}</div>
                                        </div>
                                        {item.badge && (
                                            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-border/80 bg-muted/60 text-muted-foreground">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </aside>

            {/* mobile sidebar (drawer deslizante com overlay) */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
                    {/* overlay escurecido com desfoque */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onCloseMobile}
                    />

                    {/* drawer deslizante da esquerda */}
                    <div className="relative w-72 max-w-[85vw] h-full glass-card border-r border-border/80 p-5 flex flex-col z-10 animate-in slide-in-from-left duration-300">
                        <div className="flex items-center justify-between pb-4 border-b border-border/50">
                            <span className="font-bold text-sm text-foreground flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" />
                                Navegação
                            </span>
                            <button
                                type="button"
                                onClick={onCloseMobile}
                                className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 p-1.5 rounded-lg transition-all duration-200 hover:rotate-90 active:scale-90 cursor-pointer"
                                title="Fechar menu"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-4 space-y-2">
                            {navItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        onClick={onCloseMobile}
                                        className={({ isActive }) =>
                                            cn(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                                                isActive
                                                    ? 'bg-primary/15 text-primary font-semibold border border-primary/20'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                                            )
                                        }
                                    >
                                        <Icon className="w-5 h-5 shrink-0" />
                                        <div className="flex-1 truncate">
                                            <div className="text-sm font-medium leading-tight">{item.label}</div>
                                            <div className="text-xs text-muted-foreground">{item.description}</div>
                                        </div>
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
