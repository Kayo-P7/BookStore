import * as React from 'react';
import { Edit2, Trash2, ShieldCheck, UserCheck, UserX, Power } from 'lucide-react';
import { RecordsTableLayout, ColumnDefinition } from '../../layouts/RecordsTableLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { SkeletonTable } from '../../components/ui/skeleton';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { ScreenNotice, useScreenNotice } from '../../components/ui/screen-notice';
import { UserFormModal } from './UserFormModal';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { SystemUser, UserFormData } from '../../types';

const allColumns: ColumnDefinition[] = [
    { key: 'user', label: 'Operador' },
    { key: 'role', label: 'Perfil' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Cadastrado em' },
    { key: 'actions', label: 'Ações' }
];

export function UsersPage() {
    const { user: loggedUser } = useAuth();
    const [users, setUsers] = React.useState<SystemUser[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [roleFilter, setRoleFilter] = React.useState<'ALL' | 'ADMIN' | 'SELLER'>('ALL');
    const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingUser, setEditingUser] = React.useState<SystemUser | null>(null);
    const [userToDelete, setUserToDelete] = React.useState<SystemUser | null>(null);
    const [deleting, setDeleting] = React.useState(false);
    const [visibleColumns, setVisibleColumns] = React.useState<string[]>([
        'user',
        'role',
        'status',
        'createdAt',
        'actions'
    ]);
    const pageSize = 8;

    const { notice, notices, isExiting, showNotice, closeNotice, clearAll } = useScreenNotice(4000);

    const loadUsers = React.useCallback(async () => {
        setLoading(true);
        try {
            const data = await userService.findAll();
            if (Array.isArray(data)) setUsers(data);
        } catch (err) {
            console.error('Falha ao carregar operadores', err);
            showNotice('Não foi possível carregar a lista de operadores.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotice]);

    React.useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    function handleToggleColumn(key: string) {
        setVisibleColumns(prev => {
            if (prev.includes(key)) {
                if (prev.length === 1) return prev;
                return prev.filter(k => k !== key);
            }
            return [...prev, key];
        });
    }

    async function handleSaveUser(userData: UserFormData, id?: number): Promise<boolean> {
        try {
            if (id) {
                const updated = await userService.update(id, userData);
                setUsers(prev => prev.map(u => (u.id === id ? updated : u)));
                showNotice('Dados do operador atualizados com sucesso.', 'success');
            } else {
                const created = await userService.create(userData);
                setUsers(prev => [created, ...prev]);
                showNotice('Operador cadastrado com sucesso.', 'success');
            }
            return true;
        } catch (err: unknown) {
            console.error('Falha ao salvar operador', err);
            const msg = err instanceof Error ? err.message : 'Não foi possível salvar o operador.';
            showNotice(msg, 'error');
            return false;
        }
    }

    async function handleToggleActive(targetUser: SystemUser) {
        if (targetUser.id === loggedUser?.userId) {
            showNotice('Você não pode inativar seu próprio usuário em sessão.', 'error');
            return;
        }

        try {
            const updated = await userService.update(targetUser.id, {
                name: targetUser.name,
                email: targetUser.email,
                role: targetUser.role.includes('ADMIN') ? 'ADMIN' : 'SELLER',
                active: !targetUser.active
            });
            setUsers(prev => prev.map(u => (u.id === targetUser.id ? updated : u)));
            showNotice(
                `Operador ${updated.active ? 'ativado' : 'inativado'} com sucesso.`,
                'success'
            );
        } catch (err) {
            console.error('Falha ao alternar status do operador', err);
            showNotice('Erro ao alterar status do operador.', 'error');
        }
    }

    async function handleConfirmDelete() {
        if (!userToDelete) return;
        if (userToDelete.id === loggedUser?.userId) {
            showNotice('Você não pode excluir seu próprio usuário.', 'error');
            setUserToDelete(null);
            return;
        }

        setDeleting(true);
        try {
            await userService.delete(userToDelete.id);
            setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
            setUserToDelete(null);
            showNotice('Operador removido com sucesso.', 'success');
        } catch (err) {
            console.error('Falha ao excluir operador', err);
            showNotice('Erro ao excluir operador. Tente novamente.', 'error');
        } finally {
            setDeleting(false);
        }
    }

    // filtragem combinada: busca textual, filtro de papel e filtro de status
    const filteredUsers = React.useMemo(() => {
        return users.filter(user => {
            const matchesText =
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());

            const isAdminUser = user.role.includes('ADMIN');
            const matchesRole =
                roleFilter === 'ALL' ||
                (roleFilter === 'ADMIN' && isAdminUser) ||
                (roleFilter === 'SELLER' && !isAdminUser);

            const matchesStatus =
                statusFilter === 'ALL' ||
                (statusFilter === 'ACTIVE' && user.active) ||
                (statusFilter === 'INACTIVE' && !user.active);

            return matchesText && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, roleFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    const paginatedUsers = React.useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, currentPage, pageSize]);

    // contadores analiticos do topo
    const adminCount = users.filter(u => u.role.includes('ADMIN')).length;
    const sellerCount = users.filter(u => !u.role.includes('ADMIN')).length;
    const activeCount = users.filter(u => u.active).length;

    function getInitials(name: string) {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    function formatDate(dateStr?: string) {
        if (!dateStr) return '—';
        try {
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(new Date(dateStr));
        } catch {
            return dateStr;
        }
    }

    return (
        <div className="space-y-4">
            <ScreenNotice
                notices={notices}
                notice={notice}
                isExiting={isExiting}
                onClose={closeNotice}
                onClearAll={clearAll}
            />

            {/* cards de estatisticas dos operadores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-white border border-[#e5e5e5] shadow-xs">
                    <p className="text-[11px] font-medium text-[#737373]">Total de Operadores</p>
                    <p className="text-xl font-bold text-[#171717] mt-0.5">{users.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#e5e5e5] shadow-xs">
                    <p className="text-[11px] font-medium text-[#737373]">Administradores</p>
                    <p className="text-xl font-bold text-emerald-700 mt-0.5">{adminCount}</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#e5e5e5] shadow-xs">
                    <p className="text-[11px] font-medium text-[#737373]">Vendedores</p>
                    <p className="text-xl font-bold text-teal-700 mt-0.5">{sellerCount}</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#e5e5e5] shadow-xs">
                    <p className="text-[11px] font-medium text-[#737373]">Ativos no Sistema</p>
                    <p className="text-xl font-bold text-[#171717] mt-0.5">{activeCount}</p>
                </div>
            </div>

            {/* layout padronizado de registros */}
            <RecordsTableLayout
                title="Gestão de Usuários"
                description="Controle de operadores internos, credenciais de acesso e permissões (RBAC)."
                actionLabel="Novo Operador"
                onAction={() => {
                    setEditingUser(null);
                    setIsModalOpen(true);
                }}
                searchTerm={searchTerm}
                onSearchChange={val => {
                    setSearchTerm(val);
                    setCurrentPage(1);
                }}
                searchPlaceholder="Buscar por nome ou e-mail..."
                columns={allColumns}
                visibleColumns={visibleColumns}
                onToggleColumn={handleToggleColumn}
                totalRecords={filteredUsers.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                isLoading={loading}
                isEmpty={filteredUsers.length === 0}
                emptyMessage={searchTerm ? 'Nenhum operador encontrado com os critérios de filtro.' : 'Nenhum operador cadastrado no sistema.'}
                extraFilters={
                    <div className="flex items-center gap-2">
                        {/* filtro de perfil */}
                        <select
                            value={roleFilter}
                            onChange={e => {
                                setRoleFilter(e.target.value as 'ALL' | 'ADMIN' | 'SELLER');
                                setCurrentPage(1);
                            }}
                            className="text-xs bg-white border border-[#e5e5e5] rounded-lg px-2.5 py-1.5 text-[#171717] focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                        >
                            <option value="ALL">Todos os Perfis</option>
                            <option value="ADMIN">Apenas Administradores</option>
                            <option value="SELLER">Apenas Vendedores</option>
                        </select>

                        {/* filtro de status */}
                        <select
                            value={statusFilter}
                            onChange={e => {
                                setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE');
                                setCurrentPage(1);
                            }}
                            className="text-xs bg-white border border-[#e5e5e5] rounded-lg px-2.5 py-1.5 text-[#171717] focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                        >
                            <option value="ALL">Todos os Status</option>
                            <option value="ACTIVE">Apenas Ativos</option>
                            <option value="INACTIVE">Apenas Inativos</option>
                        </select>
                    </div>
                }
            >
                {loading ? (
                    <SkeletonTable rows={pageSize} cols={visibleColumns.length} />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {visibleColumns.includes('user') && <TableHead>Operador</TableHead>}
                                {visibleColumns.includes('role') && <TableHead>Perfil</TableHead>}
                                {visibleColumns.includes('status') && <TableHead>Status</TableHead>}
                                {visibleColumns.includes('createdAt') && <TableHead>Cadastrado em</TableHead>}
                                {visibleColumns.includes('actions') && (
                                    <TableHead className="text-right">Ações</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedUsers.map(user => {
                                const isAdmin = user.role.includes('ADMIN');
                                const isSelf = user.id === loggedUser?.userId;

                                return (
                                    <TableRow key={user.id} className="hover:bg-[#fafafa]">
                                        {/* operador (avatar + nome + email) */}
                                        {visibleColumns.includes('user') && (
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-semibold text-[11px] shrink-0">
                                                        {getInitials(user.name)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-semibold text-xs text-[#171717] truncate">
                                                                {user.name}
                                                            </span>
                                                            {isSelf && (
                                                                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                                                                    Você
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-[#737373] truncate">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        )}

                                        {/* perfil de acesso */}
                                        {visibleColumns.includes('role') && (
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                                                        isAdmin
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-teal-50 text-teal-700 border-teal-200'
                                                    }`}
                                                >
                                                    {isAdmin ? (
                                                        <ShieldCheck className="w-3 h-3" />
                                                    ) : (
                                                        <UserCheck className="w-3 h-3" />
                                                    )}
                                                    {isAdmin ? 'Administrador' : 'Vendedor'}
                                                </span>
                                            </TableCell>
                                        )}

                                        {/* status ativo / inativo */}
                                        {visibleColumns.includes('status') && (
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                                        user.active
                                                            ? 'bg-emerald-100/70 text-emerald-800'
                                                            : 'bg-zinc-100 text-zinc-600'
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                            user.active ? 'bg-emerald-600' : 'bg-zinc-400'
                                                        }`}
                                                    />
                                                    {user.active ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </TableCell>
                                        )}

                                        {/* data de criacao */}
                                        {visibleColumns.includes('createdAt') && (
                                            <TableCell className="text-xs text-[#737373]">
                                                {formatDate(user.createdAt)}
                                            </TableCell>
                                        )}

                                        {/* acoes */}
                                        {visibleColumns.includes('actions') && (
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* botao ativar / inativar */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={`h-8 w-8 ${
                                                            user.active
                                                                ? 'text-[#737373] hover:text-amber-600 hover:bg-amber-50'
                                                                : 'text-[#737373] hover:text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                        onClick={() => handleToggleActive(user)}
                                                        disabled={isSelf}
                                                        title={
                                                            isSelf
                                                                ? 'Você não pode inativar sua própria conta'
                                                                : user.active
                                                                ? 'Inativar acesso deste operador'
                                                                : 'Ativar acesso deste operador'
                                                        }
                                                    >
                                                        <Power className="w-3.5 h-3.5" />
                                                    </Button>

                                                    {/* botao editar */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5]"
                                                        onClick={() => {
                                                            setEditingUser(user);
                                                            setIsModalOpen(true);
                                                        }}
                                                        title="Editar operador"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </Button>

                                                    {/* botao excluir */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-[#737373] hover:text-rose-600 hover:bg-rose-50"
                                                        onClick={() => setUserToDelete(user)}
                                                        disabled={isSelf}
                                                        title={
                                                            isSelf
                                                                ? 'Você não pode excluir sua própria conta'
                                                                : 'Excluir operador'
                                                        }
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
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

            {/* modal de cadastro / edicao */}
            <UserFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                }}
                onSubmit={handleSaveUser}
                editingUser={editingUser}
            />

            {/* dialog de confirmacao para exclusao */}
            <ConfirmDialog
                isOpen={Boolean(userToDelete)}
                onClose={() => setUserToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Excluir Operador"
                description={`Tem certeza que deseja remover o operador "${userToDelete?.name}" (${userToDelete?.email})? Esta ação não pode ser desfeita.`}
                confirmText={deleting ? 'Excluindo...' : 'Sim, Excluir'}
                destructive
            />
        </div>
    );
}
