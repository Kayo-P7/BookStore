import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, KeyRound, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';
import { cn } from './ui/button';

export function UserProfileDropdown() {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') setIsOpen(false);
        }
        if (isOpen) {
            document.addEventListener('pointerdown', handleClickOutside, true);
            window.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('pointerdown', handleClickOutside, true);
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    function handleLogout() {
        setIsOpen(false);
        navigate('/auth/login');
    }

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="flex items-center gap-2.5 p-1 rounded-full hover:bg-accent/70 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                aria-expanded={isOpen}
            >
                {/* avatar circular com iniciais e gradiente verde esmeralda */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-semibold text-xs shadow-md shadow-emerald-700/20">
                    AD
                </div>

                <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-semibold leading-tight text-foreground">Admin Livraria</span>
                    <span className="text-[11px] text-muted-foreground leading-tight">admin@bookstore.internal</span>
                </div>

                <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-card border border-border/80 shadow-2xl p-2 z-50 animate-dropdown-fade">
                    {/* identificacao de cargo e usuario */}
                    <div className="p-3 border-b border-border/50">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-foreground">Administrador Geral</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-muted-foreground border border-border/80 bg-muted/60 px-2 py-0.5 rounded-md">
                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                Master
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">admin@bookstore.internal</p>
                    </div>

                    <div className="py-1">
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/settings');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-xl hover:bg-accent/80 transition-colors text-left cursor-pointer"
                        >
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>Perfil & Conta</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/auth/forgot-password');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-xl hover:bg-accent/80 transition-colors text-left cursor-pointer"
                        >
                            <KeyRound className="w-4 h-4 text-muted-foreground" />
                            <span>Alterar Senha</span>
                        </button>
                    </div>

                    <div className="pt-1 border-t border-border/50">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-destructive rounded-xl hover:bg-destructive/10 transition-colors text-left cursor-pointer"
                        >
                            <LogOut className="w-4 h-4 text-destructive" />
                            <span>Encerrar Sessão</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
