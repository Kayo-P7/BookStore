import * as React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    BookOpen,
    ArrowLeft,
    User,
    Building2,
    Barcode,
    Hash,
    Package,
    FileText,
    BookX
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { bookService } from '../../services/bookService';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Book } from '../../types';

export function BookDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [book, setBook] = React.useState<Book | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [notFound, setNotFound] = React.useState(false);

    React.useEffect(() => {
        if (!id) {
            setNotFound(true);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setNotFound(false);

        bookService
            .findById(id)
            .then(data => {
                if (cancelled) return;
                if (data && data.id) {
                    setBook(data);
                } else {
                    setNotFound(true);
                }
            })
            .catch(() => {
                if (!cancelled) setNotFound(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    const inStock = Number(book?.stock || 0) > 0;

    return (
        <div className="min-h-screen w-full bg-[#fafafa] text-[#171717] bg-grid-pattern flex flex-col">
            {/* barra superior limpa */}
            <header className="w-full bg-white/95 backdrop-blur-sm border-b border-[#e5e5e5]">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link to={isAuthenticated ? '/catalog' : '/auth/login'} className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight text-[#171717]">BookStore</span>
                            <span className="text-[11px] text-[#737373]">Sistema de gestão de livraria</span>
                        </div>
                    </Link>

                    {isAuthenticated ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/catalog')}
                            className="gap-1.5"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Voltar ao Catálogo</span>
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/auth/login')}
                        >
                            Acessar Painel
                        </Button>
                    )}
                </div>
            </header>

            {/* conteudo principal da ficha do livro */}
            <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {loading ? (
                    <Card className="p-6 sm:p-8 space-y-6 bg-white border border-[#e5e5e5]">
                        <div className="space-y-3">
                            <Skeleton className="h-5 w-28" />
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                        <Skeleton className="h-28 w-full" />
                    </Card>
                ) : notFound || !book ? (
                    <Card className="p-8 sm:p-10 text-center bg-white border border-[#e5e5e5] space-y-4 animate-in fade-in duration-200">
                        <div className="w-14 h-14 rounded-xl bg-rose-50 border border-rose-200 text-[#e11d48] flex items-center justify-center mx-auto">
                            <BookX className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-xl font-bold text-[#171717]">Livro não encontrado</h1>
                            <p className="text-xs sm:text-sm text-[#737373] max-w-md mx-auto">
                                O título consultado pelo QR Code não existe ou foi removido do catálogo da livraria.
                            </p>
                        </div>
                        {isAuthenticated && (
                            <div className="pt-2">
                                <Button type="button" variant="default" onClick={() => navigate('/catalog')}>
                                    Ir para o Catálogo
                                </Button>
                            </div>
                        )}
                    </Card>
                ) : (
                    <Card className="bg-white border border-[#e5e5e5] rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-200">
                        {/* cabecalho com status, titulo, autor e preco */}
                        <div className="p-6 sm:p-8 border-b border-[#f0f0f0] flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                            <div className="space-y-3 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                                            inStock
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                                        }`}
                                    >
                                        {inStock ? 'Disponível em estoque' : 'Esgotado'}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono text-[#737373] bg-[#fafafa] border border-[#e5e5e5]">
                                        <Hash className="w-3 h-3" />
                                        {book.id}
                                    </span>
                                </div>

                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171717] leading-tight">
                                    {book.title}
                                </h1>

                                <div className="flex items-center gap-2 text-sm text-[#525252]">
                                    <User className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span className="font-medium">{book.authors || 'Autor não informado'}</span>
                                </div>
                            </div>

                            <div className="sm:text-right rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-5 py-4 shrink-0">
                                <span className="block text-[11px] font-semibold uppercase tracking-wider font-mono text-[#737373]">
                                    Preço Unitário
                                </span>
                                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-[#059669] mt-1">
                                    {formatCurrency(book.price)}
                                </span>
                                <span className="block text-xs text-[#737373] mt-1">
                                    {book.stock} {Number(book.stock) === 1 ? 'exemplar no acervo' : 'exemplares no acervo'}
                                </span>
                            </div>
                        </div>

                        {/* metadados tecnicos */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#f0f0f0] border-b border-[#f0f0f0] bg-[#fafafa]/50">
                            <div className="p-4 sm:p-5 flex items-start gap-3">
                                <Barcode className="w-4 h-4 text-[#737373] mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                    <span className="block text-[11px] font-semibold uppercase tracking-wider font-mono text-[#737373]">
                                        ISBN
                                    </span>
                                    <span className="block text-sm font-mono font-medium text-[#171717] mt-0.5 truncate">
                                        {book.isbn || 'Não informado'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 sm:p-5 flex items-start gap-3">
                                <Building2 className="w-4 h-4 text-[#737373] mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                    <span className="block text-[11px] font-semibold uppercase tracking-wider font-mono text-[#737373]">
                                        Editora
                                    </span>
                                    <span className="block text-sm font-medium text-[#171717] mt-0.5 truncate">
                                        {book.publisher || 'Não informada'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 sm:p-5 flex items-start gap-3">
                                <Package className="w-4 h-4 text-[#737373] mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                    <span className="block text-[11px] font-semibold uppercase tracking-wider font-mono text-[#737373]">
                                        Disponibilidade
                                    </span>
                                    <span className="block text-sm font-medium text-[#171717] mt-0.5">
                                        {inStock ? `${book.stock} un. pronta entrega` : 'Sem estoque no momento'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* sinopse / descricao */}
                        <div className="p-6 sm:p-8 space-y-2.5">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider font-mono text-[#737373]">
                                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Sinopse & Informações da Obra</span>
                            </div>
                            <p className="text-sm text-[#525252] leading-relaxed whitespace-pre-line">
                                {book.description?.trim()
                                    ? book.description
                                    : 'Nenhuma descrição adicional cadastrada para este livro no catálogo.'}
                            </p>
                        </div>
                    </Card>
                )}
            </main>
        </div>
    );
}
