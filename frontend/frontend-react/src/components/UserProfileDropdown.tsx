import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from './ui/button';

export function UserProfileDropdown() {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();

    const initials = React.useMemo(() => {
        if (!user?.name) return '';
        const parts = user.name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }, [user?.name]);

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

    if (!user) {
        return null;
    }

    function handleLogout() {
        setIsOpen(false);
        logout();
        navigate('/auth/login');
    }

    const roleName = isAdmin ? 'Administrador' : 'Vendedor';

    return (
        <div ref={dropdownRef} className="relative">
            {/* avatar circular com iniciais do operador logado */}
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="relative p-0.5 rounded-full hover:ring-2 hover:ring-primary/25 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring active:scale-95"
                aria-expanded={isOpen}
                aria-label="Perfil do usuário"
                title={`${user.name} (${user.email})`}
            >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600/90 to-teal-500/90 flex items-center justify-center text-white font-semibold text-xs shadow-xs">
                    {initials}
                </div>
            </button>

            {/* menu suspenso de perfil exibindo somente dados reais e flag de perfil */}
            {isOpen && (
                <div className="absolute right-0 mt-2.5 w-72 rounded-xl bg-white border border-[#e5e5e5] shadow-xl p-2 z-50 animate-dropdown-fade">
                    <div className="p-3 border-b border-[#f0f0f0]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-semibold text-xs shadow-xs shrink-0">
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-xs font-bold text-[#171717] truncate">
                                        {user.name}
                                    </span>
                                    <span className={cn(
                                        "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                        isAdmin
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                            : "bg-teal-50 text-teal-700 border border-teal-200"
                                    )}>
                                        {roleName}
                                    </span>
                                </div>
                                <p className="text-[11px] text-[#737373] truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="py-1">
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/settings');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#171717] rounded-lg hover:bg-[#f5f5f5] transition-colors text-left cursor-pointer"
                        >
                            <User className="w-4 h-4 text-[#737373]" />
                            <span>Diagnóstico & Saúde</span>
                        </button>
                    </div>

                    <div className="pt-1 border-t border-[#f0f0f0]">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#e11d48] rounded-lg hover:bg-rose-50 transition-colors text-left cursor-pointer"
                        >
                            <LogOut className="w-4 h-4 text-[#e11d48]" />
                            <span>Encerrar Sessão</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
