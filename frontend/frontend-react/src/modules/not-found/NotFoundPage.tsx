import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Home, ArrowLeft, BookX, ShoppingBag, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#fafafa] text-[#171717]">
            {/* card central no padrao dub refero */}
            <div className="w-full max-w-lg bg-white border border-[#e5e5e5] rounded-2xl shadow-xl shadow-black/5 p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-200 text-center">
                {/* icone de livro nao encontrado com paleta esmeralda unificada */}
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-[#059669] flex items-center justify-center mx-auto mb-5 shadow-xs">
                    <BookX className="w-8 h-8 stroke-[1.8]" />
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#059669] bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full mb-3">
                    Erro 404 • Página Não Encontrada
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
                    Conteúdo não localizado
                </h1>

                <p className="text-sm text-[#737373] mt-2 leading-relaxed max-w-md mx-auto">
                    O endereço que você tentou acessar não existe, foi removido ou o link inserido está incorreto.
                </p>

                {/* acoes principais */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-7">
                    <Button
                        type="button"
                        variant="default"
                        size="lg"
                        hoverLift
                        onClick={() => navigate('/dashboard')}
                        className="w-full sm:w-auto gap-2"
                    >
                        <Home className="w-4 h-4" />
                        <span>Voltar ao Painel</span>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => {
                            if (window.history.length > 1) {
                                navigate(-1);
                            } else {
                                navigate('/dashboard');
                            }
                        }}
                        className="w-full sm:w-auto gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Página Anterior</span>
                    </Button>
                </div>

                {/* atalhos rapidos no rodape do card */}
                <div className="mt-8 pt-6 border-t border-[#f0f0f0]">
                    <span className="text-[11px] font-semibold tracking-wider text-[#737373] uppercase font-mono block mb-3">
                        Atalhos Úteis
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                        <Link
                            to="/books"
                            className="p-2.5 rounded-lg border border-[#e5e5e5] bg-[#fafafa] hover:bg-emerald-50/50 hover:border-emerald-200 transition-colors flex flex-col items-center gap-1 group"
                        >
                            <BookOpen className="w-4 h-4 text-[#737373] group-hover:text-[#059669] transition-colors" />
                            <span className="text-xs font-medium text-[#171717]">Livros</span>
                        </Link>

                        <Link
                            to="/customers"
                            className="p-2.5 rounded-lg border border-[#e5e5e5] bg-[#fafafa] hover:bg-emerald-50/50 hover:border-emerald-200 transition-colors flex flex-col items-center gap-1 group"
                        >
                            <Users className="w-4 h-4 text-[#737373] group-hover:text-[#059669] transition-colors" />
                            <span className="text-xs font-medium text-[#171717]">Clientes</span>
                        </Link>

                        <Link
                            to="/sales"
                            className="p-2.5 rounded-lg border border-[#e5e5e5] bg-[#fafafa] hover:bg-emerald-50/50 hover:border-emerald-200 transition-colors flex flex-col items-center gap-1 group"
                        >
                            <ShoppingBag className="w-4 h-4 text-[#737373] group-hover:text-[#059669] transition-colors" />
                            <span className="text-xs font-medium text-[#171717]">Vendas</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* rodape de identificacao no padrao dub */}
            <div className="mt-6 flex items-center gap-2 text-xs text-[#737373]">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-2xs">
                    <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-[#171717]">BookStore OS</span>
                <span>•</span>
                <span>Plataforma de Gestão de Livraria</span>
            </div>
        </div>
    );
}
