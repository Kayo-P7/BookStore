import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    ShoppingBag,
    MapPin,
    Settings,
    UserCog,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
    const { isAdmin } = useAuth();

    const navItems = [
        {
            to: '/dashboard',
            label: 'Dashboard',
            description: 'Indicadores e métricas operacionais',
            icon: LayoutDashboard
        },
        {
            to: '/catalog',
            label: 'Catálogo',
            description: 'Inventário e títulos do acervo',
            icon: BookOpen
        },
        {
            to: '/customers',
            label: 'Clientes',
            description: 'Base de clientes e contatos',
            icon: Users
        },
        {
            to: '/sales',
            label: 'Vendas',
            description: 'Transações comerciais e pedidos',
            icon: ShoppingBag
        },
        {
            to: '/logistics',
            label: 'Logística',
            description: 'Localização e consulta de CEP',
            icon: MapPin
        },
        ...(isAdmin
            ? [
                  {
                      to: '/users',
                      label: 'Usuários',
                      description: 'Operadores e controle de acesso',
                      icon: UserCog
                  }
              ]
            : []),
        {
            to: '/settings',
            label: 'Configurações',
            description: 'Diagnóstico e saúde dos serviços',
            icon: Settings
        }
    ];

    return (
        <>
            {/* desktop sidebar retratil com transicao elastica */}
            <aside
                className={cn(
                    'hidden md:flex flex-col fixed top-16 bottom-0 left-0 z-30 glass-sidebar',
                    'transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
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
                                        'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 active:scale-[0.98]',
                                        isActive
                                            ? 'bg-white text-[#171717] border border-[#e5e5e5] shadow-2xs'
                                            : 'text-[#525252] hover:text-[#171717] hover:bg-[#f5f5f5]',
                                        collapsed && 'justify-center px-0'
                                    )
                                }
                                title={collapsed ? `${item.label} — ${item.description}` : undefined}
                            >
                                {({ isActive }) => (
                                    <>
                                        {/* indicador lateral minimalista de pagina ativa */}
                                        {isActive && (
                                            <span
                                                className={cn(
                                                    'absolute top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-[#059669] animate-message-liquid',
                                                    collapsed ? 'left-1' : 'left-1.5'
                                                )}
                                            />
                                        )}

                                        <Icon
                                            className={cn(
                                                'w-5 h-5 shrink-0 transition-colors',
                                                isActive
                                                    ? 'text-[#059669]'
                                                    : 'text-[#737373] group-hover:text-[#171717]'
                                            )}
                                        />

                                        {!collapsed && (
                                            <div className="flex-1 flex items-center justify-between min-w-0">
                                                <div className="truncate">
                                                    <div
                                                        className={cn(
                                                            'text-sm leading-tight truncate',
                                                            isActive
                                                                ? 'font-semibold text-[#171717]'
                                                                : 'font-medium text-[#525252] group-hover:text-[#171717]'
                                                        )}
                                                    >
                                                        {item.label}
                                                    </div>
                                                    <div className="text-[11px] text-[#737373] leading-tight truncate mt-0.5">
                                                        {item.description}
                                                    </div>
                                                </div>
                                                {item.badge && (
                                                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-[#e5e5e5] bg-[#fafafa] text-[#737373]">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </aside>

            {/* mobile sidebar (drawer deslizante com overlay com fisica de mola) */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex animate-dialog-fade">
                    {/* overlay escurecido com desfoque */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
                        onClick={onCloseMobile}
                    />

                    {/* drawer deslizante da esquerda com animacao de mola */}
                    <div className="relative w-72 max-w-[85vw] h-full glass-card border-r border-border/80 p-5 flex flex-col z-10 animate-drawer-spring shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-border/50">
                            <span className="font-bold text-sm text-foreground flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" />
                                Navegação
                            </span>
                            <button
                                type="button"
                                onClick={onCloseMobile}
                                className="text-red-500 hover:text-red-700 bg-red-50/70 hover:bg-red-100 border border-red-200/60 p-1.5 rounded-lg transition-all duration-200 hover:rotate-90 active:scale-90 cursor-pointer"
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
                                                'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150',
                                                isActive
                                                    ? 'bg-white text-[#171717] border border-[#e5e5e5] shadow-2xs'
                                                    : 'text-[#525252] hover:text-[#171717] hover:bg-[#f5f5f5]'
                                            )
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {isActive && (
                                                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-[#059669]" />
                                                )}

                                                <Icon
                                                    className={cn(
                                                        'w-5 h-5 shrink-0 transition-colors',
                                                        isActive
                                                            ? 'text-[#059669]'
                                                            : 'text-[#737373] group-hover:text-[#171717]'
                                                    )}
                                                />
                                                <div className="flex-1 truncate">
                                                    <div
                                                        className={cn(
                                                            'text-sm leading-tight',
                                                            isActive
                                                                ? 'font-semibold text-[#171717]'
                                                                : 'font-medium text-[#525252]'
                                                        )}
                                                    >
                                                        {item.label}
                                                    </div>
                                                    <div className="text-xs text-[#737373] mt-0.5">{item.description}</div>
                                                </div>
                                            </>
                                        )}
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
