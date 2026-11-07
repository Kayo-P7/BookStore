import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export function AuthLayout() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#fafafa] text-[#171717] bg-grid-pattern">
            {/* container central no padrao dub refero: solido branco, borda hairline #e5e5e5, rounded-2xl */}
            <div className="relative z-10 w-full max-w-md my-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-white rounded-2xl p-7 sm:p-9 border border-[#e5e5e5] shadow-xl shadow-black/5">
                    {/* logotipo */}
                    <div className="flex flex-col items-center text-center mb-7">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 mb-3.5">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-[#171717]">BookStore OS</h1>
                        <p className="text-xs text-[#737373] mt-1">Plataforma Unificada de Gestão de Livraria</p>
                    </div>

                    {/* conteudo da rota (Login ou Recuperacao) */}
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
