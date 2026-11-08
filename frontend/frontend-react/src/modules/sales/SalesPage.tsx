import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { RecordsTableLayout, ColumnDefinition } from '../../layouts/RecordsTableLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { SkeletonTable } from '../../components/ui/skeleton';
import { SaleFormModal } from './SaleFormModal';
import { ScreenNotice, useScreenNotice } from '../../components/ui/screen-notice';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { saleService } from '../../services/saleService';
import { bookService } from '../../services/bookService';
import { customerService } from '../../services/customerService';
import { Sale, Book, Customer } from '../../types';

const allColumns: ColumnDefinition[] = [
    { key: 'id', label: 'ID Pedido' },
    { key: 'date', label: 'Data & Hora' },
    { key: 'customer', label: 'Cliente' },
    { key: 'book', label: 'Livro' },
    { key: 'quantity', label: 'Qtd' },
    { key: 'total', label: 'Total' }
];

export function SalesPage() {
    const [sales, setSales] = React.useState<Sale[]>([]);
    const [books, setBooks] = React.useState<Book[]>([]);
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [visibleColumns, setVisibleColumns] = React.useState<string[]>([
        'id',
        'date',
        'customer',
        'book',
        'quantity',
        'total'
    ]);
    const pageSize = 10;

    const { notice, notices, isExiting, showNotice, closeNotice, clearAll } = useScreenNotice(4000);
    const location = useLocation();

    // abertura fluida do modal quando navegado a partir do botao 'Nova Venda' da dashboard
    React.useEffect(() => {
        if (location.state && (location.state as { openModal?: boolean }).openModal) {
            setIsModalOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    async function loadData() {
        setLoading(true);
        try {
            const [salesData, booksData, customersData] = await Promise.all([
                saleService.findAll(),
                bookService.findAll(),
                customerService.findAll()
            ]);
            if (Array.isArray(salesData)) setSales(salesData);
            if (Array.isArray(booksData)) setBooks(booksData);
            if (Array.isArray(customersData)) setCustomers(customersData);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        loadData();
    }, []);

    function handleToggleColumn(key: string) {
        setVisibleColumns(prev => {
            if (prev.includes(key)) {
                if (prev.length === 1) return prev;
                return prev.filter(k => k !== key);
            }
            return [...prev, key];
        });
    }

    async function handleRegisterSale(saleData: { customerId: number; bookId: number; quantity: number; selectedBook?: Book }) {
        try {
            const created = await saleService.create({
                customerId: saleData.customerId,
                bookId: saleData.bookId,
                quantity: saleData.quantity
            });
            setSales(prev => [...prev, created]);
            // atualiza livros para refletir o novo estoque
            const booksData = await bookService.findAll();
            if (Array.isArray(booksData)) setBooks(booksData);
            showNotice('Venda registrada com sucesso.', 'success');
            return true;
        } catch (err) {
            console.error('Falha ao registrar venda', err);
            showNotice('Não foi possível registrar a venda. Verifique o estoque e tente novamente.', 'error');
            return false;
        }
    }

    function customerName(id: number) {
        return customers.find(c => String(c.id) === String(id))?.name || `Cliente #${id}`;
    }

    function bookTitle(id: number) {
        return books.find(b => String(b.id) === String(id))?.title || `Livro #${id}`;
    }

    const filteredSales = sales.filter(s => {
        const q = searchTerm.toLowerCase();
        const cName = customerName(s.customerId).toLowerCase();
        const bTitle = bookTitle(s.bookId).toLowerCase();
        return cName.includes(q) || bTitle.includes(q) || String(s.id).includes(q);
    });

    const paginatedSales = filteredSales.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* aviso suave com fade in e fade out exclusivo desta tela */}
            <ScreenNotice
                notices={notices}
                notice={notice}
                isExiting={isExiting}
                onClose={closeNotice}
                onClearAll={clearAll}
            />

            <RecordsTableLayout
                title="Gestão de Vendas"
                description={`Total de ${sales.length} transações comerciais faturadas`}
                actionLabel="Nova Venda"
                onAction={() => setIsModalOpen(true)}
                searchTerm={searchTerm}
                onSearchChange={val => {
                    setSearchTerm(val);
                    setCurrentPage(1);
                }}
                searchPlaceholder="Buscar por cliente, título ou ID..."
                columns={allColumns}
                visibleColumns={visibleColumns}
                onToggleColumn={handleToggleColumn}
                totalRecords={filteredSales.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                isLoading={loading}
                isEmpty={filteredSales.length === 0}
                emptyMessage={searchTerm ? 'Nenhuma venda encontrada para esta busca.' : 'Nenhuma venda registrada ainda.'}
            >
                {loading ? (
                    <SkeletonTable rows={5} cols={visibleColumns.length} />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {visibleColumns.includes('id') && <TableHead className="w-20">ID</TableHead>}
                                {visibleColumns.includes('date') && <TableHead>Data / Hora</TableHead>}
                                {visibleColumns.includes('customer') && <TableHead>Cliente</TableHead>}
                                {visibleColumns.includes('book') && <TableHead>Livro</TableHead>}
                                {visibleColumns.includes('quantity') && <TableHead>Qtd</TableHead>}
                                {visibleColumns.includes('total') && <TableHead className="text-right">Total</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedSales.map(sale => (
                                <TableRow key={sale.id}>
                                    {visibleColumns.includes('id') && (
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            #{sale.id}
                                        </TableCell>
                                    )}
                                    {visibleColumns.includes('date') && (
                                        <TableCell className="text-xs text-muted-foreground">
                                            {formatDate(sale.createdAt)}
                                        </TableCell>
                                    )}
                                    {visibleColumns.includes('customer') && (
                                        <TableCell className="font-semibold text-foreground">
                                            {customerName(sale.customerId)}
                                        </TableCell>
                                    )}
                                    {visibleColumns.includes('book') && (
                                        <TableCell className="text-xs text-muted-foreground">
                                            {bookTitle(sale.bookId)}
                                        </TableCell>
                                    )}
                                    {visibleColumns.includes('quantity') && (
                                        <TableCell className="text-xs font-mono font-medium text-foreground">
                                            {sale.quantity}x
                                        </TableCell>
                                    )}
                                    {visibleColumns.includes('total') && (
                                        <TableCell className="text-right font-mono font-semibold text-xs text-foreground">
                                            {formatCurrency(sale.total)}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </RecordsTableLayout>

            <SaleFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleRegisterSale}
                customers={customers}
                books={books}
            />
        </div>
    );
}
