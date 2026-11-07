import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { cn } from '../components/ui/button';

export function AppLayout() {
    const [collapsed, setCollapsed] = React.useState<boolean>(() => {
        return localStorage.getItem('bookstore-sidebar-collapsed') === 'true';
    });
    const [mobileOpen, setMobileOpen] = React.useState(false);

    function toggleCollapse() {
        setCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('bookstore-sidebar-collapsed', String(next));
            return next;
        });
    }

    // atalho ctrl+b ou cmd+b para recolher a barra lateral
    React.useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                toggleCollapse();
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
            {/* header superior 100% largura fixo no topo com alternador responsivo */}
            <Header
                collapsed={collapsed}
                onToggleCollapse={toggleCollapse}
                onToggleMobileSidebar={() => setMobileOpen(prev => !prev)}
            />

            <div className="flex-1 flex pt-16">
                {/* sidebar lateral retratil desktop + drawer mobile */}
                <Sidebar
                    collapsed={collapsed}
                    onToggleCollapse={toggleCollapse}
                    mobileOpen={mobileOpen}
                    onCloseMobile={() => setMobileOpen(false)}
                />

                {/* area central de conteudo responsiva com transicao fluida */}
                <main
                    className={cn(
                        'flex-1 min-w-0 transition-all duration-300 ease-in-out px-4 sm:px-8 py-8',
                        collapsed ? 'md:ml-20' : 'md:ml-72'
                    )}
                >
                    <div className="w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
