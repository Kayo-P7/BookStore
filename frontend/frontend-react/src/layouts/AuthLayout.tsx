import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { ThemeToggle } from '../components/ui/theme-toggle';

export function AuthLayout() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background text-foreground bg-grid-pattern selection:bg-primary/20 selection:text-primary">
            {/* esferas dinamicas com desfoque gaussiano (animate-blob) */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/20 dark:bg-emerald-500/15 blur-3xl animate-blob pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-teal-500/20 dark:bg-teal-500/15 blur-3xl animate-blob animation-delay-2000 pointer-events-none" />
            <div className="absolute top-3/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-mint-400/15 dark:bg-emerald-600/10 blur-3xl animate-blob animation-delay-4000 pointer-events-none" />

            {/* botao flutuante de alternar tema no topo direito com efeito liquid */}
            <div className="absolute top-6 right-6 z-20">
                <ThemeToggle />
            </div>

            {/* container central com card de vidro duplo */}
            <div className="relative z-10 w-full max-w-md my-8 animate-in fade-in zoom-in-95 duration-300">
                {/* camada externa com borda sutil */}
                <div className="p-1 rounded-3xl bg-gradient-to-b from-white/30 to-white/5 dark:from-white/10 dark:to-transparent shadow-2xl">
                    {/* card interno em vidro fosco (glassmorphism duplo) */}
                    <div className="glass-card rounded-[22px] p-7 sm:p-9 border border-white/40 dark:border-white/10 backdrop-blur-2xl">
                        {/* logotipo */}
                        <div className="flex flex-col items-center text-center mb-7">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-600/25 mb-3.5">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground">BookStore OS</h1>
                            <p className="text-xs text-muted-foreground mt-1">Plataforma Unificada de Gestão de Livraria</p>
                        </div>

                        {/* conteudo da rota (Login ou Recuperacao) */}
                        <Outlet />
                    </div>
                </div>
            </div>

            {/* rodape em formato de capsula/pilula translucida com indicador de status pulsante */}
            <div className="relative z-10 mt-2 mb-4">
                <div className="glass-pill px-4 py-1.5 flex items-center gap-2.5 shadow-lg border border-border/60 text-xs text-muted-foreground">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="font-mono text-[11px]">Sistema Seguro • Criptografia TLS • Microsserviços Ativos</span>
                </div>
            </div>
        </div>
    );
}
