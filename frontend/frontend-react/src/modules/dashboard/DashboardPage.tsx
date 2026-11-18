import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    BookMarked,
    Users,
    ShoppingBag,
    TrendingUp,
    Plus,
    ArrowUpRight,
    RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { formatCurrency, formatShortDate } from '../../utils/formatters';
import { bookService } from '../../services/bookService';
import { customerService } from '../../services/customerService';
import { saleService } from '../../services/saleService';
import { loanService } from '../../services/loanService';
import { invalidateHttpCache } from '../../services/httpClient';
import { Book, Customer, Loan, Sale } from '../../types';

export function DashboardPage() {
    const navigate = useNavigate();
    const [books, setBooks] = React.useState<Book[]>([]);
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const [loans, setLoans] = React.useState<Loan[]>([]);
    const [recentSales, setRecentSales] = React.useState<Sale[]>([]);
    const [salesCount, setSalesCount] = React.useState(0);
    const [totalRevenue, setTotalRevenue] = React.useState(0);
    const [loading, setLoading] = React.useState(true);

    async function loadData(forceRefresh = false) {
        if (forceRefresh) {
            invalidateHttpCache();
        }
        setLoading(true);
        try {
            const [b, c, summaryResult, loansResult] = await Promise.allSettled([
                bookService.findSummaryList(),
                customerService.findAll(),
                saleService.getSummary(),
                loanService.findAll()
            ]);
            if (b.status === 'fulfilled' && Array.isArray(b.value)) setBooks(b.value);
            if (c.status === 'fulfilled' && Array.isArray(c.value)) setCustomers(c.value);
            if (loansResult.status === 'fulfilled' && Array.isArray(loansResult.value)) {
                setLoans(loansResult.value);
            } else {
                setLoans([]);
            }

            if (summaryResult.status === 'fulfilled' && summaryResult.value && Array.isArray(summaryResult.value.recentSales)) {
                setSalesCount(Number(summaryResult.value.totalSales) || 0);
                setTotalRevenue(Number(summaryResult.value.totalRevenue) || 0);
                setRecentSales(summaryResult.value.recentSales);
            } else {
                const fallbackSales = await saleService.findAll().catch(() => []);
                if (Array.isArray(fallbackSales)) {
                    setSalesCount(fallbackSales.length);
                    setTotalRevenue(fallbackSales.reduce((acc, sale) => acc + (Number(sale.total) || 0), 0));
                    setRecentSales(fallbackSales.slice(-6).reverse());
                }
            }
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        loadData();
    }, []);

    const customerMap = React.useMemo(
        () => new Map(customers.map(c => [Number(c.id), c.name])),
        [customers]
    );
    const bookMap = React.useMemo(
        () => new Map(books.map(b => [Number(b.id), b.title])),
        [books]
    );

    function customerName(id: number) {
        return customerMap.get(Number(id)) || `Cliente #${id}`;
    }

    function bookTitle(id: number) {
        return bookMap.get(Number(id)) || `Livro #${id}`;
    }

    const activeLoans = React.useMemo(
        () => loans.filter(loan => loan.status === 'ACTIVE'),
        [loans]
    );

    const displayedActiveLoans = React.useMemo(
        () => [...activeLoans].reverse().slice(0, 6),
        [activeLoans]
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* barra superior de acoes e titulo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                        Painel Executivo
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Indicadores consolidados de faturamento, catálogo, empréstimos e clientes da livraria.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadData(true)}
                        disabled={loading}
                        className="gap-2"
                        title="Atualizar métricas"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Sincronizar</span>
                    </Button>

                    <Button
                        variant="default"
                        size="default"
                        hoverLift
                        onClick={() => navigate('/sales', { state: { openModal: true } })}
                        className="gap-2 shadow-2xs hover:shadow-xs active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nova Venda</span>
                    </Button>
                </div>
            </div>

            {/* kpis consolidados incluindo emprestimos ativos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
                <Card hoverLift className="p-5 border border-border/70 hover:border-border transition-colors group">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                            Total de Livros
                        </span>
                        <BookOpen className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono sm:font-sans">
                            {books.length}
                        </div>
                        <p className="text-xs text-muted-foreground/80 mt-1">Títulos registrados no catálogo</p>
                    </div>
                </Card>

                <Card hoverLift className="p-5 border border-border/70 hover:border-border transition-colors group">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                            Clientes Ativos
                        </span>
                        <Users className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono sm:font-sans">
                            {customers.length}
                        </div>
                        <p className="text-xs text-muted-foreground/80 mt-1">Leitores e clientes com cadastro ativo</p>
                    </div>
                </Card>

                <Card hoverLift className="p-5 border border-border/70 hover:border-border transition-colors group">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                            Empréstimos Ativos
                        </span>
                        <BookMarked className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono sm:font-sans">
                            {activeLoans.length}
                        </div>
                        <p className="text-xs text-muted-foreground/80 mt-1">Exemplares emprestados no momento</p>
                    </div>
                </Card>

                <Card hoverLift className="p-5 border border-border/70 hover:border-border transition-colors group">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                            Vendas Concluídas
                        </span>
                        <ShoppingBag className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono sm:font-sans">
                            {salesCount}
                        </div>
                        <p className="text-xs text-muted-foreground/80 mt-1">Pedidos faturados e entregues</p>
                    </div>
                </Card>

                <Card hoverLift className="p-5 border border-border/70 hover:border-border transition-colors group">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                            Faturamento Total
                        </span>
                        <TrendingUp className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
                            {formatCurrency(totalRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground/80 mt-1">Receita bruta consolidada</p>
                    </div>
                </Card>
            </div>

            {/* grids com ultimas vendas e emprestimos ativos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ultimas vendas */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-base font-bold">Últimas Vendas</CardTitle>
                            <CardDescription className="text-xs">Transações recentes registradas no sistema</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/sales')}
                            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <span>Ver todas</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentSales.length === 0 ? (
                            <div className="text-center py-12 text-xs text-muted-foreground">
                                Nenhuma venda registrada ainda.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Qtd</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentSales.map(sale => (
                                        <TableRow key={sale.id}>
                                            <TableCell className="font-semibold text-xs truncate max-w-[160px]">
                                                {bookTitle(sale.bookId)}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground truncate max-w-[140px]">
                                                {customerName(sale.customerId)}
                                            </TableCell>
                                            <TableCell className="text-xs font-mono text-muted-foreground">
                                                {sale.quantity}x
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-semibold text-xs text-foreground">
                                                {formatCurrency(sale.total)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* emprestimos ativos */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-base font-bold">Empréstimos Ativos</CardTitle>
                            <CardDescription className="text-xs">Exemplares emprestados aguardando devolução</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/loans')}
                            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <span>Ver todos</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {displayedActiveLoans.length === 0 ? (
                            <div className="text-center py-12 text-xs text-muted-foreground">
                                Nenhum empréstimo ativo no momento.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Livro</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Devolução Prevista</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {displayedActiveLoans.map(loan => (
                                        <TableRow key={loan.id}>
                                            <TableCell className="font-semibold text-xs truncate max-w-[160px]">
                                                {bookTitle(loan.bookId)}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground truncate max-w-[140px]">
                                                {customerName(loan.customerId)}
                                            </TableCell>
                                            <TableCell className="text-xs font-mono text-muted-foreground">
                                                {formatShortDate(loan.dueDate)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="text-xs font-semibold text-emerald-600">
                                                    Ativo
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
