import * as React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { RecordsTableLayout, ColumnDefinition } from '../../layouts/RecordsTableLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { SkeletonTable } from '../../components/ui/skeleton';
import { CustomerFormModal } from './CustomerFormModal';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { ScreenNotice, useScreenNotice } from '../../components/ui/screen-notice';
import { customerService } from '../../services/customerService';
import { Customer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { maskPhone } from '../../utils/masks';

const allColumns: ColumnDefinition[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nome Completo' },
    { key: 'email', label: 'E-mail' },
    { key: 'phone', label: 'Telefone' },
    { key: 'location', label: 'Cidade / UF' },
    { key: 'actions', label: 'Ações' }
];

export function CustomersPage() {
    const { isAdmin } = useAuth();
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null);
    const [customerToDelete, setCustomerToDelete] = React.useState<Customer | null>(null);
    const [deleting, setDeleting] = React.useState(false);
    const [visibleColumns, setVisibleColumns] = React.useState<string[]>([
        'id',
        'name',
        'email',
        'phone',
        'location',
        'actions'
    ]);
    const pageSize = 8;

    const { notice, isExiting, showNotice, closeNotice } = useScreenNotice(3000);

    async function loadCustomers() {
        setLoading(true);
        try {
            const data = await customerService.findAll();
            if (Array.isArray(data)) setCustomers(data);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        loadCustomers();
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

    async function handleSaveCustomer(customerData: Omit<Customer, 'id'>, id?: number) {
        try {
            if (id) {
                const updated = await customerService.update(id, customerData);
                setCustomers(prev => prev.map(c => (c.id === id ? updated : c)));
                showNotice('Cadastro do cliente atualizado com sucesso.', 'success');
            } else {
                const created = await customerService.create(customerData);
                setCustomers(prev => [...prev, created]);
                showNotice('Cliente cadastrado com sucesso.', 'success');
            }
            return true;
        } catch (err) {
            console.error('Falha ao salvar cliente', err);
            showNotice('Não foi possível salvar o cliente. Verifique os dados.', 'error');
            return false;
        }
    }

    async function handleConfirmDelete() {
        if (!customerToDelete) return;
        setDeleting(true);
        try {
            await customerService.delete(customerToDelete.id);
            setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
            setCustomerToDelete(null);
            showNotice('Cliente excluído com sucesso.', 'success');
        } catch (err) {
            console.error('Falha ao excluir cliente', err);
            showNotice('Erro ao excluir cliente. Tente novamente.', 'error');
        } finally {
            setDeleting(false);
        }
    }

    const filteredCustomers = customers.filter(c => {
        const q = searchTerm.toLowerCase();
        return (
            c.name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.city?.toLowerCase().includes(q) ||
            c.phone?.includes(q)
        );
    });

    const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* aviso suave com fade in e fade out exclusivo desta tela */}
            <ScreenNotice
                notice={notice}
                isExiting={isExiting}
                onClose={closeNotice}
            />

            <RecordsTableLayout
                title="Gestão de Clientes"
                description={`Total de ${customers.length} clientes e contatos cadastrados`}
                actionLabel="Novo Cliente"
                onAction={() => {
                    setEditingCustomer(null);
                    setIsModalOpen(true);
                }}
                searchTerm={searchTerm}
                onSearchChange={val => {
                    setSearchTerm(val);
                    setCurrentPage(1);
                }}
                searchPlaceholder="Buscar por nome, e-mail ou cidade..."
                columns={allColumns}
                visibleColumns={visibleColumns}
                onToggleColumn={handleToggleColumn}
                totalRecords={filteredCustomers.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                isLoading={loading}
                isEmpty={filteredCustomers.length === 0}
                emptyMessage={searchTerm ? 'Nenhum usuário encontrado para esta busca.' : 'Nenhum cliente cadastrado.'}
            >
                {loading ? (
                    <SkeletonTable rows={5} cols={visibleColumns.length} />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {visibleColumns.includes('id') && <TableHead className="w-16">ID</TableHead>}
                                {visibleColumns.includes('name') && <TableHead>Cliente</TableHead>}
                                {visibleColumns.includes('email') && <TableHead>E-mail</TableHead>}
                                {visibleColumns.includes('phone') && <TableHead>Telefone</TableHead>}
                                {visibleColumns.includes('location') && <TableHead>Cidade / UF</TableHead>}
                                {visibleColumns.includes('actions') && <TableHead className="text-right">Ações</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedCustomers.map(customer => (
                                <TableRow key={customer.id}>
                                    {visibleColumns.includes('id') && (
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            #{customer.id}
                                        </TableCell>
                                    )}
                                    {visibleColumns.includes('name') && (
                                        <TableCell className="font-semibold text-foreground flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                {(customer.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <span>{customer.name}</span>
                                        </TableCell>
                                    )}
                                    {visibleColumns.includes('email') && (
                                        <TableCell className="text-muted-foreground text-xs">
                                            {customer.email}
                                        </TableCell>
                                    )}
                                    {visibleColumns.includes('phone') && (
                                        <TableCell className="text-muted-foreground text-xs font-mono">
                                            {customer.phone ? maskPhone(customer.phone) : '--'}
                                        </TableCell>
                                    )}
                                    {visibleColumns.includes('location') && (
                                        <TableCell className="text-xs">
                                            {customer.city ? (
                                                <span className="font-medium text-foreground">
                                                    {customer.city}{' '}
                                                    <span className="text-muted-foreground font-normal">
                                                        / {customer.state || ''}
                                                    </span>
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground/60">Não informado</span>
                                            )}
                                        </TableCell>
                                    )}
                                    {visibleColumns.includes('actions') && (
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    onClick={() => {
                                                        setEditingCustomer(customer);
                                                        setIsModalOpen(true);
                                                    }}
                                                    title="Editar cliente"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </Button>
                                                {isAdmin && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => setCustomerToDelete(customer)}
                                                        title="Excluir cliente"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </RecordsTableLayout>

            <CustomerFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCustomer(null);
                }}
                onSubmit={handleSaveCustomer}
                editingCustomer={editingCustomer}
            />

            <ConfirmDialog
                isOpen={Boolean(customerToDelete)}
                title="Excluir Cliente"
                description={`Deseja realmente excluir "${customerToDelete?.name}"? Esta ação removerá o cadastro permanentemente e é irreversível.`}
                confirmText="Excluir Permanentemente"
                cancelText="Cancelar"
                loading={deleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setCustomerToDelete(null)}
            />
        </div>
    );
}
