import * as React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from './button';

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const maskId = React.useId();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={cn(
                'relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center',
                'glass-card hover:bg-accent/80 border border-border/80 shadow-sm',
                'transition-all duration-300 ease-out hover:scale-105 active:scale-90 cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none group',
                className
            )}
            title={isDark ? 'Tema Claro' : 'Tema Escuro'}
            aria-label={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
        >
            {/* efeito glow liquido suave ao passar o mouse */}
            <div className="absolute inset-0 rounded-full bg-primary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm pointer-events-none" />

            {/* icone svg com morphing liquido fluido entre sol e lua */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative z-10 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-12"
            >
                <mask id={maskId}>
                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                    <circle
                        cx={isDark ? '17' : '28'}
                        cy={isDark ? '8' : '2'}
                        r="7"
                        fill="black"
                        className="transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    />
                </mask>

                {/* corpo central que expande e recebe o corte em formato de lua crescente */}
                <circle
                    cx="12"
                    cy="12"
                    r={isDark ? '8.5' : '5'}
                    fill="currentColor"
                    mask={`url(#${maskId})`}
                    className={cn(
                        'transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                        isDark ? 'text-primary' : 'text-amber-500 dark:text-amber-400'
                    )}
                />

                {/* raios do sol que se contraem e giram como liquido no modo escuro */}
                <g
                    stroke="currentColor"
                    className={cn(
                        'origin-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                        isDark
                            ? 'opacity-0 scale-40 rotate-90 text-primary pointer-events-none'
                            : 'opacity-100 scale-100 rotate-0 text-amber-500 dark:text-amber-400'
                    )}
                >
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </g>
            </svg>
        </button>
    );
}
