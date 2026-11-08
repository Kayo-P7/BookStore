import * as React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { bookService } from '../../services/bookService';
import { Book } from '../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { SkeletonTable } from '../../components/ui/skeleton';
import { ScreenNotice, useScreenNotice } from '../../components/ui/screen-notice';
import { RecordsTableLayout, ColumnDefinition } from '../../layouts/RecordsTableLayout';
import { BookFormModal } from './BookFormModal';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export function BooksPage() {
    const { isAdmin } = useAuth();
    const [books, setBooks] = React.useState<Book[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingBook, setEditingBook] = React.useState<Book | null>(null);
    const [bookToDelete, setBookToDelete] = React.useState<Book | null>(null);
    const [deleting, setDeleting] = React.useState(false);
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
        { key: 'status', label: 'Status' },
        { key: 'actions', label: 'Ações' }
    ];

    const [visibleColumns, setVisibleColumns] = React.useState<string[]>([
        'id',
        'title',
        'authors',
        'price',
        'stock',
        'status',
        'actions'
    ]);

    const { notice, notices, isExiting, showNotice, closeNotice, clearAll } = useScreenNotice(4000);

    const loadBooks = React.useCallback(async () => {
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
    }, [showNotice]);

    React.useEffect(() => {
        loadBooks();
    }, [loadBooks]);

    function handleToggleColumn(key: string) {
        setVisibleColumns(prev =>
            prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
        );
    }

    async function handleSaveBook(data: Omit<Book, 'id'>, id?: number): Promise<boolean> {
        try {
            if (id) {
                const updated = await bookService.update(id, data);
                setBooks(prev => prev.map(b => (b.id === id ? updated : b)));
                showNotice('Livro atualizado com sucesso no catálogo.', 'success');
            } else {
                const created = await bookService.create(data);
                setBooks(prev => [created, ...prev]);
                showNotice('Livro cadastrado com sucesso no catálogo.', 'success');
                setCurrentPage(1);
            }
            return true;
        } catch {
            showNotice('Erro ao salvar livro. Verifique os dados e tente novamente.', 'error');
            throw new Error('Falha ao salvar livro');
        }
    }

    async function handleConfirmDelete() {
        if (!bookToDelete) return;
        setDeleting(true);
        try {
            await bookService.delete(bookToDelete.id);
            setBooks(prev => prev.filter(b => b.id !== bookToDelete.id));
            setBookToDelete(null);
            showNotice('Livro removido do catálogo com sucesso.', 'success');
        } catch {
            showNotice('Erro ao excluir livro do catálogo.', 'error');
        } finally {
            setDeleting(false);
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
            <ScreenNotice
                notices={notices}
                notice={notice}
                isExiting={isExiting}
                onClose={closeNotice}
                onClearAll={clearAll}
            />

            <RecordsTableLayout
                title="Gestão de Catálogo"
                description={`Gerenciamento de títulos, inventário e preços (${books.length} títulos cadastrados)`}
                actionLabel={isAdmin ? 'Novo Livro' : undefined}
                onAction={
                    isAdmin
                        ? () => {
                              setEditingBook(null);
                              setIsModalOpen(true);
                          }
                        : undefined
                }
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
                emptyMessage={
                    searchTerm
                        ? 'Nenhum livro encontrado para esta busca.'
                        : 'Nenhum livro cadastrado no catálogo.'
                }
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
                                {visibleColumns.includes('actions') && (
                                    <TableHead className="text-right">Ações</TableHead>
                                )}
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
                                        {visibleColumns.includes('actions') && (
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {isAdmin && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                onClick={() => {
                                                                    setEditingBook(book);
                                                                    setIsModalOpen(true);
                                                                }}
                                                                title="Editar livro"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => setBookToDelete(book)}
                                                                title="Excluir livro"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </>
                                                    )}
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
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingBook(null);
                }}
                onSubmit={handleSaveBook}
                editingBook={editingBook}
            />

            <ConfirmDialog
                isOpen={Boolean(bookToDelete)}
                title="Excluir Livro"
                description={`Deseja realmente remover o título "${bookToDelete?.title}" do catálogo? Esta ação não pode ser desfeita.`}
                confirmText={deleting ? 'Excluindo...' : 'Sim, Excluir'}
                destructive
                onConfirm={handleConfirmDelete}
                onCancel={() => setBookToDelete(null)}
            />
        </div>
    );
}
