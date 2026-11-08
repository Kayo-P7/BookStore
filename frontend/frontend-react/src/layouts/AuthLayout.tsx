import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export function AuthLayout() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#fafafa] text-[#171717] bg-grid-pattern">
            {/* container central ampliado e elegante: solido branco, borda hairline #e5e5e5, rounded-3xl */}
            <div className="relative z-10 w-full max-w-[500px] my-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-white rounded-3xl p-8 sm:p-11 border border-[#e5e5e5] shadow-2xl shadow-black/6">
                    {/* logotipo */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 mb-4 ring-4 ring-emerald-500/10">
                            <BookOpen className="w-7 h-7" />
                        </div>
                        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#171717]">BookStore OS</h1>
                        <p className="text-sm text-[#737373] mt-1.5 font-normal">Plataforma Unificada de Gestão de Livraria</p>
                    </div>

                    {/* conteudo da rota de autenticacao */}
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
