import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
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
import { formatCurrency } from '../../utils/formatters';
import { bookService } from '../../services/bookService';
import { customerService } from '../../services/customerService';
import { saleService } from '../../services/saleService';
import { Book, Customer, Sale } from '../../types';
import { cn } from '../../components/ui/button';

export function DashboardPage() {
    const navigate = useNavigate();
    const [books, setBooks] = React.useState<Book[]>([]);
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const [sales, setSales] = React.useState<Sale[]>([]);
    const [loading, setLoading] = React.useState(true);

    async function loadData() {
        setLoading(true);
        try {
            const [b, c, s] = await Promise.allSettled([
                bookService.findAll(),
                customerService.findAll(),
                saleService.findAll()
            ]);
            if (b.status === 'fulfilled' && Array.isArray(b.value)) setBooks(b.value);
            if (c.status === 'fulfilled' && Array.isArray(c.value)) setCustomers(c.value);
            if (s.status === 'fulfilled' && Array.isArray(s.value)) setSales(s.value);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        loadData();
    }, []);

    const totalRevenue = sales.reduce((acc, sale) => acc + (Number(sale.total) || 0), 0);

    function customerName(id: number) {
        return customers.find(c => String(c.id) === String(id))?.name || `Cliente #${id}`;
    }

    function bookTitle(id: number) {
        return books.find(b => String(b.id) === String(id))?.title || `Livro #${id}`;
    }

    const recentSales = sales.slice(-6).reverse();
    const recentBooks = books.slice(-6).reverse();

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* barra superior de acoes e titulo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                        Painel Executivo
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Indicadores consolidados de faturamento, catálogo e clientes da livraria.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadData}
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

            {/* kpis em layout arquitetural minimalista sem caixas coloridas cliches de ia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                            Vendas Concluídas
                        </span>
                        <ShoppingBag className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono sm:font-sans">
                            {sales.length}
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

            {/* grids com listas recentes de vendas e catalogo */}
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

                {/* destaques do catalogo */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-base font-bold">Destaques do Catálogo</CardTitle>
                            <CardDescription className="text-xs">Últimos títulos inseridos no inventário</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/catalog')}
                            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <span>Ver acervo</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentBooks.length === 0 ? (
                            <div className="text-center py-12 text-xs text-muted-foreground">
                                Nenhum livro cadastrado no catálogo.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Autor</TableHead>
                                        <TableHead>Preço</TableHead>
                                        <TableHead className="text-right">Estoque</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentBooks.map(book => {
                                        const inStock = Number(book.stock) > 0;
                                        return (
                                            <TableRow key={book.id}>
                                                <TableCell className="font-semibold text-xs truncate max-w-[160px]">
                                                    {book.title}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground truncate max-w-[140px]">
                                                    {book.authors || 'Não informado'}
                                                </TableCell>
                                                <TableCell className="text-xs font-mono">
                                                    {formatCurrency(book.price)}
                                                </TableCell>
                                                <TableCell className="text-right text-xs">
                                                    <div className="inline-flex items-center justify-end gap-1.5 font-mono">
                                                        <span
                                                            className={cn(
                                                                'w-1.5 h-1.5 rounded-full shrink-0',
                                                                inStock ? 'bg-emerald-500' : 'bg-destructive'
                                                            )}
                                                        />
                                                        <span className="font-medium text-foreground">
                                                            {book.stock}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            un.
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
