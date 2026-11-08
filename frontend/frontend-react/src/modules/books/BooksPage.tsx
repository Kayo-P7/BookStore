import * as React from 'react';
import { bookService } from '../../services/bookService';
import { Book } from '../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { SkeletonTable } from '../../components/ui/skeleton';
import { ScreenNotice, useScreenNotice } from '../../components/ui/screen-notice';
import { RecordsTableLayout, ColumnDefinition } from '../../layouts/RecordsTableLayout';
import { BookFormModal } from './BookFormModal';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../components/ui/button';

export function BooksPage() {
    const { isAdmin } = useAuth();
    const [books, setBooks] = React.useState<Book[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 8;

    const allColumns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Título' },
        { key: 'authors', label: 'Autores' },
        { key: 'isbn', label: 'ISBN' },
        { key: 'publisher', label: 'Editora' },
        { key: 'price', label: 'Preço' },
        { key: 'stock', label: 'Estoque' },
        { key: 'status', label: 'Status' }
    ];

    const [visibleColumns, setVisibleColumns] = React.useState<string[]>([
        'id',
        'title',
        'authors',
        'price',
        'stock',
        'status'
    ]);

    const { notice, isExiting, showNotice, closeNotice } = useScreenNotice(3000);

    async function loadBooks() {
        setLoading(true);
        try {
            const data = await bookService.findAll();
            if (Array.isArray(data)) {
                setBooks(data);
            }
        } catch {
            showNotice('Não foi possível carregar os livros. Verifique os serviços.', 'error');
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        loadBooks();
    }, []);

    function handleToggleColumn(key: string) {
        setVisibleColumns(prev =>
            prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
        );
    }

    async function handleAddBook(data: Omit<Book, 'id'>) {
        try {
            await bookService.create(data);
            showNotice('Livro cadastrado com sucesso no catálogo.', 'success');
            await loadBooks();
            setCurrentPage(1);
            return true;
        } catch {
            showNotice('Erro ao cadastrar livro. Tente novamente.', 'error');
            throw new Error('Falha ao salvar livro');
        }
    }

    const filteredBooks = books.filter(b => {
        const q = searchTerm.toLowerCase();
        return (
            b.title?.toLowerCase().includes(q) ||
            b.authors?.toLowerCase().includes(q) ||
            b.isbn?.toLowerCase().includes(q) ||
            b.publisher?.toLowerCase().includes(q)
        );
    });

    const paginatedBooks = filteredBooks.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="space-y-4">
            {/* aviso de feedback com fade suave restrito a tela de livros */}
            <ScreenNotice
                notice={notice}
                isExiting={isExiting}
                onClose={closeNotice}
            />

            <RecordsTableLayout
                title="Gestão de Catálogo"
                description={`Gerenciamento de títulos, inventário e preços (${books.length} títulos cadastrados)`}
                actionLabel={isAdmin ? "Novo Livro" : undefined}
                onAction={isAdmin ? () => setIsModalOpen(true) : undefined}
                searchTerm={searchTerm}
                onSearchChange={val => {
                    setSearchTerm(val);
                    setCurrentPage(1);
                }}
                searchPlaceholder="Buscar por título ou autor..."
                columns={allColumns}
                visibleColumns={visibleColumns}
                onToggleColumn={handleToggleColumn}
                totalRecords={filteredBooks.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                isLoading={loading}
                isEmpty={filteredBooks.length === 0}
                emptyMessage={searchTerm ? 'Nenhum livro encontrado para esta busca.' : 'Nenhum livro cadastrado no catálogo.'}
            >
                {loading ? (
                    <SkeletonTable rows={5} cols={visibleColumns.length} />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {visibleColumns.includes('id') && <TableHead className="w-20">ID</TableHead>}
                                {visibleColumns.includes('title') && <TableHead>Título</TableHead>}
                                {visibleColumns.includes('authors') && <TableHead>Autor(es)</TableHead>}
                                {visibleColumns.includes('isbn') && <TableHead>ISBN</TableHead>}
                                {visibleColumns.includes('publisher') && <TableHead>Editora</TableHead>}
                                {visibleColumns.includes('price') && <TableHead>Preço</TableHead>}
                                {visibleColumns.includes('stock') && <TableHead className="text-right">Estoque</TableHead>}
                                {visibleColumns.includes('status') && <TableHead className="text-right">Status</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedBooks.map(book => {
                                const inStock = Number(book.stock) > 0;
                                return (
                                    <TableRow key={book.id}>
                                        {visibleColumns.includes('id') && (
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                #{book.id}
                                            </TableCell>
                                        )}
                                        {visibleColumns.includes('title') && (
                                            <TableCell className="font-semibold text-foreground">
                                                {book.title}
                                            </TableCell>
                                        )}
                                        {visibleColumns.includes('authors') && (
                                            <TableCell className="text-muted-foreground text-xs">
                                                {book.authors || 'Não informado'}
                                            </TableCell>
                                        )}
                                        {visibleColumns.includes('isbn') && (
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {book.isbn || '—'}
                                            </TableCell>
                                        )}
                                        {visibleColumns.includes('publisher') && (
                                            <TableCell className="text-xs text-muted-foreground">
                                                {book.publisher || '—'}
                                            </TableCell>
                                        )}
                                        {visibleColumns.includes('price') && (
                                            <TableCell className="font-mono font-medium text-foreground">
                                                {formatCurrency(book.price)}
                                            </TableCell>
                                        )}
                                        {visibleColumns.includes('stock') && (
                                            <TableCell className="text-right font-mono text-xs">
                                                <span className="font-semibold text-foreground">{book.stock}</span>{' '}
                                                <span className="text-[11px] text-muted-foreground font-normal">un.</span>
                                            </TableCell>
                                        )}
                                        {visibleColumns.includes('status') && (
                                            <TableCell className="text-right">
                                                <div className="inline-flex items-center justify-end text-xs font-medium">
                                                    <span className={inStock ? 'text-foreground' : 'text-muted-foreground'}>
                                                        {inStock ? 'Disponível' : 'Esgotado'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </RecordsTableLayout>

            <BookFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddBook}
            />
        </div>
    );
}
