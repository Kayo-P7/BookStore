import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // tema travado em 'light' no padrao dub conforme solicitado pelo usuario
    const [theme] = useState<Theme>('light');

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('bookstore-theme', 'light');

        // sincroniza com iframe do modulo vue se presente na tela
        const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
        iframes.forEach(iframe => {
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({ type: 'THEME_CHANGE', theme: 'light' }, '*');
            }
        });
    }, []);

    function toggleTheme() {
        // desativado temporariamente para manter somente tema claro no padrao dub
    }

    function setTheme(_nextTheme: Theme) {
        // mantido apenas para compatibilidade de tipo
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
    }
    return context;
}
