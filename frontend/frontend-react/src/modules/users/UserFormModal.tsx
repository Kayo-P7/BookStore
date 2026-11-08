import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Loader2, ShieldCheck, UserCheck } from 'lucide-react';
import { Modal } from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { SystemUser, UserFormData, UserRole } from '../../types';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (userData: UserFormData, id?: number) => Promise<boolean>;
    editingUser?: SystemUser | null;
}

export function UserFormModal({
    isOpen,
    onClose,
    onSubmit,
    editingUser
}: UserFormModalProps) {
    const isEdit = Boolean(editingUser);
    const [submitting, setSubmitting] = React.useState(false);
    const [formError, setFormError] = React.useState<string | null>(null);

    const schema = React.useMemo(() => {
        return z.object({
            name: z.string().min(1, 'Informe o nome completo do usuário.'),
            email: z
                .string()
                .min(1, 'Informe o e-mail de acesso.')
                .email('Informe um e-mail válido (ex: usuario@bookstore.internal).'),
            password: isEdit
                ? z
                      .string()
                      .optional()
                      .refine(
                          val => !val || val.length >= 6,
                          'A nova senha deve conter no mínimo 6 caracteres.'
                      )
                : z
                      .string()
                      .min(1, 'A senha provisória é obrigatória.')
                      .min(6, 'A senha deve conter no mínimo 6 caracteres.'),
            role: z.enum(['ADMIN', 'SELLER'] as const, {
                errorMap: () => ({ message: 'Selecione o perfil de acesso.' })
            }),
            active: z.boolean().default(true)
        });
    }, [isEdit]);

    type FormValues = z.infer<typeof schema>;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            password: '',
            role: 'SELLER',
            active: true
        }
    });

    const selectedRole = watch('role');
    const isActive = watch('active');

    React.useEffect(() => {
        setFormError(null);
        if (editingUser) {
            const normalizedRole = editingUser.role.includes('ADMIN') ? 'ADMIN' : 'SELLER';
            reset({
                name: editingUser.name || '',
                email: editingUser.email || '',
                password: '',
                role: normalizedRole as UserRole,
                active: editingUser.active ?? true
            });
        } else {
            reset({
                name: '',
                email: '',
                password: '',
                role: 'SELLER',
                active: true
            });
        }
    }, [editingUser, reset, isOpen]);

    async function handleFormSubmit(values: FormValues) {
        setSubmitting(true);
        setFormError(null);
        try {
            const payload: UserFormData = {
                name: values.name.trim(),
                email: values.email.trim().toLowerCase(),
                role: values.role,
                active: values.active
            };

            if (values.password && values.password.trim().length > 0) {
                payload.password = values.password.trim();
            }

            const success = await onSubmit(payload, editingUser?.id);
            if (success) {
                onClose();
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Falha ao salvar operador.';
            setFormError(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Editar Usuário' : 'Novo Usuário'}
            description={
                isEdit
                    ? 'Atualize os dados e o tipo de perfil do usuário.'
                    : 'Cadastre um novo usuário com perfil de Administrador ou Vendedor.'
            }
        >
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                {formError && (
                    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                    </div>
                )}

                {/* nome completo */}
                <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">
                        Nome Completo <span className="text-rose-500">*</span>
                    </label>
                    <Input
                        {...register('name')}
                        placeholder="Ex: Ana Silva"
                        disabled={submitting}
                    />
                    {errors.name && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.name.message}</p>
                    )}
                </div>

                {/* e-mail */}
                <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">
                        E-mail de Acesso <span className="text-rose-500">*</span>
                    </label>
                    <Input
                        {...register('email')}
                        type="email"
                        placeholder="ana.silva@bookstore.internal"
                        disabled={submitting}
                    />
                    {errors.email && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>
                    )}
                </div>

                {/* senha */}
                <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">
                        {isEdit ? 'Nova Senha (opcional)' : 'Senha de Acesso'}{' '}
                        {!isEdit && <span className="text-rose-500">*</span>}
                    </label>
                    <Input
                        {...register('password')}
                        type="password"
                        placeholder={isEdit ? 'Deixe em branco para manter a senha atual' : 'Mínimo de 6 caracteres'}
                        disabled={submitting}
                        autoComplete="new-password"
                    />
                    {errors.password && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.password.message}</p>
                    )}
                    {isEdit && (
                        <p className="text-[11px] text-[#737373] mt-1">
                            Preencha apenas caso queira redefinir a credencial do operador.
                        </p>
                    )}
                </div>

                {/* papel de acesso (RBAC) */}
                <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-2">
                        Perfil de Acesso <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setValue('role', 'SELLER', { shouldValidate: true })}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                selectedRole === 'SELLER'
                                    ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500 text-teal-900'
                                    : 'border-[#e5e5e5] hover:border-[#d4d4d4] bg-white text-[#171717]'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <UserCheck className={`w-4 h-4 ${selectedRole === 'SELLER' ? 'text-teal-600' : 'text-[#737373]'}`} />
                                <span className="text-xs font-bold">Vendedor</span>
                            </div>
                            <p className="text-[11px] text-[#737373] leading-tight">
                                Opera vendas, atende clientes e consulta acervo.
                            </p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setValue('role', 'ADMIN', { shouldValidate: true })}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                selectedRole === 'ADMIN'
                                    ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 text-emerald-900'
                                    : 'border-[#e5e5e5] hover:border-[#d4d4d4] bg-white text-[#171717]'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck className={`w-4 h-4 ${selectedRole === 'ADMIN' ? 'text-emerald-600' : 'text-[#737373]'}`} />
                                <span className="text-xs font-bold">Administrador</span>
                            </div>
                            <p className="text-[11px] text-[#737373] leading-tight">
                                Acesso total a acervo, operadores, clientes e dados.
                            </p>
                        </button>
                    </div>
                    {errors.role && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.role.message}</p>
                    )}
                </div>

                {/* status ativo / inativo */}
                {isEdit && (
                    <div className="pt-2 border-t border-[#f0f0f0]">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                {...register('active')}
                                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                                <span className="text-xs font-semibold text-[#171717]">
                                    Usuário Ativo
                                </span>
                                <p className="text-[11px] text-[#737373]">
                                    {isActive
                                        ? 'O usuário pode entrar no sistema normalmente.'
                                        : 'Acesso bloqueado. O usuário não conseguirá realizar login.'}
                                </p>
                            </div>
                        </label>
                    </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#f0f0f0]">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={submitting}
                        className="text-xs"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    >
                        {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                        {isEdit ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
