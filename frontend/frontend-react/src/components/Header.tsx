import * as React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react';
import { UserProfileDropdown } from './UserProfileDropdown';

interface HeaderProps {
    collapsed: boolean;
    onToggleCollapse: () => void;
    onToggleMobileSidebar: () => void;
}

export function Header({
    collapsed,
    onToggleCollapse,
    onToggleMobileSidebar
}: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 h-16 glass-header border-b border-border/80 px-4 sm:px-6 flex items-center justify-between transition-all">
            {/* lado esquerdo: botao unico inteligente de recolher/abrir e logotipo */}
            <div className="flex items-center gap-2.5 sm:gap-3">
                {/* botao unico flexivel e responsivo de alternancia */}
                <button
                    type="button"
                    onClick={() => {
                        if (window.innerWidth < 768) {
                            onToggleMobileSidebar();
                        } else {
                            onToggleCollapse();
                        }
                    }}
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring"
                    title={collapsed ? 'Expandir barra lateral (Ctrl+B)' : 'Recolher barra lateral (Ctrl+B)'}
                    aria-label={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
                >
                    {/* no mobile exibe icone de menu drawer, no desktop exibe estado de recolher/expandir */}
                    <span className="md:hidden flex items-center justify-center">
                        <Menu className="w-5 h-5" />
                    </span>
                    <span className="hidden md:flex items-center justify-center">
                        {collapsed ? (
                            <PanelLeftOpen className="w-5 h-5 text-primary animate-in fade-in duration-200" />
                        ) : (
                            <PanelLeftClose className="w-5 h-5 text-muted-foreground hover:text-foreground animate-in fade-in duration-200" />
                        )}
                    </span>
                </button>

                <Link to="/dashboard" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform duration-200">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                            BookStore <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-border/80 bg-muted/60 text-muted-foreground">OS</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground hidden sm:block">Painel Administrativo</span>
                    </div>
                </Link>
            </div>

            {/* lado direito: perfil do usuario com avatar circular */}
            <div className="flex items-center gap-2 sm:gap-3">
                <UserProfileDropdown />
            </div>
        </header>
    );
}
