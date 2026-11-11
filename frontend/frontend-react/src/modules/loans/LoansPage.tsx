import * as React from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { RecordsTableLayout, ColumnDefinition } from '../../layouts/RecordsTableLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { SkeletonTable } from '../../components/ui/skeleton';
import { ScreenNotice, useScreenNotice } from '../../components/ui/screen-notice';
import { LoanFormModal } from './LoanFormModal';
import { loanService } from '../../services/loanService';
import { bookService } from '../../services/bookService';
import { customerService } from '../../services/customerService';
import { Loan, Book, Customer } from '../../types';

const columns: ColumnDefinition[] = [
    { key: 'id', label: 'ID' },
    { key: 'customer', label: 'Cliente' },
    { key: 'book', label: 'Livro' },
    { key: 'loanDate', label: 'Data do empréstimo' },
    { key: 'dueDate', label: 'Previsão de devolução' },
    { key: 'returnDate', label: 'Devolvido em' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Ações' }
];

function formatLoanDate(value: string | number[] | null | undefined) {
    if (!value) return '—';
    const date = Array.isArray(value)
        ? new Date(value[0], (value[1] || 1) - 1, value[2] || 1)
        : new Date(`${value}`.length === 10 ? `${value}T00:00:00` : value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
}

export function LoansPage() {
    const [loans, setLoans] = React.useState<Loan[]>([]);
    const [books, setBooks] = React.useState<Book[]>([]);
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [savingReturnId, setSavingReturnId] = React.useState<number | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [visibleColumns, setVisibleColumns] = React.useState(columns.map(column => column.key));
    const pageSize = 10;
    const { notice, notices, isExiting, showNotice, closeNotice, clearAll } = useScreenNotice();

    const loadData = React.useCallback(async () => {
        setLoading(true);
        try {
            const [loanData, bookData, customerData] = await Promise.all([
                loanService.findAll(), bookService.findAll(), customerService.findAll()
            ]);
            if (Array.isArray(loanData)) setLoans(loanData);
            if (Array.isArray(bookData)) setBooks(bookData);
            if (Array.isArray(customerData)) setCustomers(customerData);
        } catch (error) {
            console.error('Falha ao carregar empréstimos', error);
            showNotice('Não foi possível carregar os empréstimos. Verifique os serviços.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotice]);

    React.useEffect(() => { loadData(); }, [loadData]);

    function customerName(id: number) {
        return customers.find(customer => customer.id === id)?.name || `Cliente #${id}`;
    }

    function bookTitle(id: number) {
        return books.find(book => book.id === id)?.title || `Livro #${id}`;
    }

    async function handleCreate(data: { customerId: number; bookId: number; dueDate: string }) {
        try {
            const created = await loanService.create(data);
            setLoans(previous => [created, ...previous]);
            const updatedBooks = await bookService.findAll();
            if (Array.isArray(updatedBooks)) setBooks(updatedBooks);
            showNotice('Empréstimo registrado com sucesso.', 'success');
            return true;
        } catch (error) {
            console.error('Falha ao registrar empréstimo', error);
            showNotice(error instanceof Error ? error.message : 'Não foi possível registrar o empréstimo.', 'error');
            return false;
        }
    }

    async function handleReturn(loan: Loan) {
        if (loan.status !== 'ACTIVE' || savingReturnId !== null) return;
        setSavingReturnId(loan.id);
        try {
            const updated = await loanService.returnLoan(loan.id);
            setLoans(previous => previous.map(item => item.id === loan.id ? (updated || { ...item, status: 'RETURNED', returnDate: new Date().toISOString().slice(0, 10) }) : item));
            const updatedBooks = await bookService.findAll();
            if (Array.isArray(updatedBooks)) setBooks(updatedBooks);
            showNotice('Devolução registrada com sucesso.', 'success');
        } catch (error) {
            console.error('Falha ao registrar devolução', error);
            showNotice(error instanceof Error ? error.message : 'Não foi possível registrar a devolução.', 'error');
        } finally {
            setSavingReturnId(null);
        }
    }

    function toggleColumn(key: string) {
        setVisibleColumns(previous => previous.includes(key)
            ? (previous.length === 1 ? previous : previous.filter(item => item !== key))
            : [...previous, key]);
    }

    const filteredLoans = loans.filter(loan => {
        const query = searchTerm.toLowerCase().trim();
        return !query || customerName(loan.customerId).toLowerCase().includes(query)
            || bookTitle(loan.bookId).toLowerCase().includes(query)
            || String(loan.id).includes(query)
            || loan.status.toLowerCase().includes(query);
    });
    const paginatedLoans = filteredLoans.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const activeCount = loans.filter(loan => loan.status === 'ACTIVE').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <ScreenNotice notices={notices} notice={notice} isExiting={isExiting}
                onClose={closeNotice} onClearAll={clearAll} />
            <RecordsTableLayout
                title="Gestão de Empréstimos"
                description={`${loans.length} empréstimo(s) registrado(s) • ${activeCount} ativo(s)`}
                actionLabel="Novo empréstimo" onAction={() => setIsModalOpen(true)}
                searchTerm={searchTerm} onSearchChange={value => { setSearchTerm(value); setCurrentPage(1); }}
                searchPlaceholder="Buscar por cliente, livro, status ou ID..."
                columns={columns} visibleColumns={visibleColumns} onToggleColumn={toggleColumn}
                totalRecords={filteredLoans.length} currentPage={currentPage} pageSize={pageSize}
                onPageChange={setCurrentPage} isLoading={loading} isEmpty={filteredLoans.length === 0}
                emptyMessage={searchTerm ? 'Nenhum empréstimo encontrado para esta busca.' : 'Nenhum empréstimo registrado ainda.'}
            >
                {loading ? <SkeletonTable rows={5} cols={visibleColumns.length} /> : (
                    <Table>
                        <TableHeader><TableRow>
                            {visibleColumns.includes('id') && <TableHead className="w-20">ID</TableHead>}
                            {visibleColumns.includes('customer') && <TableHead>Cliente</TableHead>}
                            {visibleColumns.includes('book') && <TableHead>Livro</TableHead>}
                            {visibleColumns.includes('loanDate') && <TableHead>Empréstimo</TableHead>}
                            {visibleColumns.includes('dueDate') && <TableHead>Devolução prevista</TableHead>}
                            {visibleColumns.includes('returnDate') && <TableHead>Devolvido em</TableHead>}
                            {visibleColumns.includes('status') && <TableHead>Status</TableHead>}
                            {visibleColumns.includes('actions') && <TableHead className="text-right">Ações</TableHead>}
                        </TableRow></TableHeader>
                        <TableBody>
                            {paginatedLoans.map(loan => {
                                const active = loan.status === 'ACTIVE';
                                return <TableRow key={loan.id}>
                                    {visibleColumns.includes('id') && <TableCell className="font-mono text-xs text-muted-foreground">#{loan.id}</TableCell>}
                                    {visibleColumns.includes('customer') && <TableCell className="font-semibold text-foreground">{customerName(loan.customerId)}</TableCell>}
                                    {visibleColumns.includes('book') && <TableCell className="text-sm text-muted-foreground">{bookTitle(loan.bookId)}</TableCell>}
                                    {visibleColumns.includes('loanDate') && <TableCell className="text-xs text-muted-foreground">{formatLoanDate(loan.loanDate)}</TableCell>}
                                    {visibleColumns.includes('dueDate') && <TableCell className="text-xs text-muted-foreground">{formatLoanDate(loan.dueDate)}</TableCell>}
                                    {visibleColumns.includes('returnDate') && <TableCell className="text-xs text-muted-foreground">{formatLoanDate(loan.returnDate)}</TableCell>}
                                    {visibleColumns.includes('status') && <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${active ? 'bg-amber-50 text-amber-700' : loan.status === 'RETURNED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {loan.status === 'ACTIVE' ? 'Ativo' : loan.status === 'RETURNED' ? 'Devolvido' : 'Cancelado'}
                                        </span>
                                    </TableCell>}
                                    {visibleColumns.includes('actions') && <TableCell className="text-right">
                                        {active ? <Button variant="outline" size="sm" disabled={savingReturnId !== null}
                                            onClick={() => handleReturn(loan)}>
                                            {savingReturnId === loan.id ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                            Registrar devolução
                                        </Button> : <span className="text-xs text-muted-foreground">—</span>}
                                    </TableCell>}
                                </TableRow>;
                            })}
                        </TableBody>
                    </Table>
                )}
            </RecordsTableLayout>
            <LoanFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreate} customers={customers} books={books} />
        </div>
    );
}
