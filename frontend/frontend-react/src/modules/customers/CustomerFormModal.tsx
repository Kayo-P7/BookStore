import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Search, Loader2 } from 'lucide-react';
import { Modal } from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Customer } from '../../types';
import { customerService } from '../../services/customerService';
import { maskCep, maskPhone, onlyDigits, handleNumericKeyDown } from '../../utils/masks';

const customerSchema = z.object({
    name: z.string().min(1, 'Informe o nome completo do cliente.'),
    email: z
        .string()
        .min(1, 'Informe o endereço de e-mail.')
        .email('Informe um e-mail válido (ex: nome@dominio.com).'),
    phone: z.string().optional(),
    cep: z
        .string()
        .optional()
        .refine(
            val => !val || onlyDigits(val).length === 8,
            'O CEP deve conter exatamente 8 dígitos numéricos.'
        ),
    street: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional()
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (customerData: Omit<Customer, 'id'>, id?: number) => Promise<boolean>;
    editingCustomer?: Customer | null;
}

export function CustomerFormModal({
    isOpen,
    onClose,
    onSubmit,
    editingCustomer
}: CustomerFormModalProps) {
    const [submitting, setSubmitting] = React.useState(false);
    const [lookingUpCep, setLookingUpCep] = React.useState(false);
    const [formError, setFormError] = React.useState<string | null>(null);
    const isSubmittingRef = React.useRef(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        clearErrors,
        formState: { errors }
    } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            cep: '',
            street: '',
            neighborhood: '',
            city: '',
            state: ''
        }
    });

    const cepValue = watch('cep');
    const phoneValue = watch('phone');

    React.useEffect(() => {
        setFormError(null);
        isSubmittingRef.current = false;
        if (editingCustomer) {
            reset({
                name: editingCustomer.name || '',
                email: editingCustomer.email || '',
                phone: maskPhone(editingCustomer.phone || ''),
                cep: maskCep(editingCustomer.cep || ''),
                street: editingCustomer.street || '',
                neighborhood: editingCustomer.neighborhood || '',
                city: editingCustomer.city || '',
                state: (editingCustomer.state || '').toUpperCase()
            });
        } else {
            reset({
                name: '',
                email: '',
                phone: '',
                cep: '',
                street: '',
                neighborhood: '',
                city: '',
                state: ''
            });
        }
    }, [editingCustomer, isOpen, reset]);

    async function handleLookupCep(customCleanCep?: string) {
        const cleanCep = customCleanCep || onlyDigits(cepValue);
        if (cleanCep.length !== 8) return;

        setLookingUpCep(true);
        setFormError(null);
        try {
            const address = await customerService.lookupCep(cleanCep);
            if (address && !address.erro) {
                setValue('street', address.logradouro || address.street || '', { shouldValidate: true });
                setValue('neighborhood', address.bairro || address.neighborhood || '', { shouldValidate: true });
                setValue('city', address.localidade || address.city || '', { shouldValidate: true });
                setValue('state', (address.uf || address.state || '').toUpperCase(), { shouldValidate: true });
            } else if (address?.erro) {
                setFormError('CEP não localizado. Verifique os dígitos informados.');
            }
        } catch {
            setFormError('Não foi possível consultar o endereço no momento. Preencha manualmente.');
        } finally {
            setLookingUpCep(false);
        }
    }

    async function handleFormSubmit(data: CustomerFormData) {
        // bloqueio imediato contra duplo clique
        if (isSubmittingRef.current || submitting) return;

        isSubmittingRef.current = true;
        setSubmitting(true);
        setFormError(null);
        try {
            const success = await onSubmit(
                {
                    name: data.name.trim(),
                    email: data.email.trim(),
                    phone: data.phone?.trim() || '',
                    cep: data.cep?.trim() || '',
                    street: data.street?.trim() || '',
                    neighborhood: data.neighborhood?.trim() || '',
                    city: data.city?.trim() || '',
                    state: (data.state?.trim() || '').toUpperCase()
                },
                editingCustomer?.id
            );
            if (success) {
                reset();
                onClose();
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro ao processar dados do cliente.';
            setFormError(message);
        } finally {
            isSubmittingRef.current = false;
            setSubmitting(false);
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingCustomer ? 'Editar Usuário / Cliente' : 'Novo Usuário / Cliente'}
            description={
                editingCustomer
                    ? 'Atualize as informações de cadastro e endereço.'
                    : 'Preencha os dados. O CEP e telefone aplicam máscara automática.'
            }
            maxWidth="max-w-lg"
        >
            <form noValidate onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                {/* alerta de erro de api dentro do proprio modal */}
                {formError && (
                    <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-[#e11d48] text-xs flex items-center gap-2 animate-in fade-in duration-150">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80">Nome Completo</label>
                    <Input
                        placeholder="Ex: Carlos Silva"
                        error={Boolean(errors.name)}
                        {...register('name', {
                            onChange: () => {
                                if (errors.name) clearErrors('name');
                            }
                        })}
                    />
                    {errors.name && (
                        <p className="text-[11px] text-[#E11D48] font-medium flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground/80">E-mail</label>
                        <Input
                            type="email"
                            placeholder="carlos@email.com"
                            error={Boolean(errors.email)}
                            {...register('email', {
                                onChange: () => {
                                    if (errors.email) clearErrors('email');
                                }
                            })}
                        />
                        {errors.email && (
                            <p className="text-[11px] text-[#E11D48] font-medium flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground/80">Telefone</label>
                        <Input
                            placeholder="(11) 98765-4321"
                            maxLength={15}
                            inputMode="numeric"
                            value={phoneValue || ''}
                            onKeyDown={handleNumericKeyDown}
                            onChange={e => {
                                const masked = maskPhone(e.target.value);
                                setValue('phone', masked, { shouldValidate: true });
                            }}
                        />
                    </div>
                </div>

                {/* cep com mascara automatica e busca via viacep integrada ao completar 8 digitos */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80 flex items-center justify-between">
                        <span>CEP</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                            Preenchimento automático do hífen (-)
                        </span>
                    </label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="01001-000"
                            maxLength={9}
                            inputMode="numeric"
                            value={cepValue || ''}
                            error={Boolean(errors.cep)}
                            onKeyDown={handleNumericKeyDown}
                            onChange={e => {
                                const masked = maskCep(e.target.value);
                                setValue('cep', masked, { shouldValidate: true });
                                if (errors.cep) clearErrors('cep');
                                const cleanDigits = onlyDigits(masked);
                                if (cleanDigits.length === 8) {
                                    handleLookupCep(cleanDigits);
                                }
                            }}
                            onBlur={() => handleLookupCep()}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="default"
                            onClick={() => handleLookupCep()}
                            disabled={lookingUpCep}
                            className="shrink-0 gap-1.5 text-xs"
                            title="Consultar endereço pelo CEP"
                        >
                            {lookingUpCep ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Search className="w-3.5 h-3.5" />
                            )}
                            <span>{lookingUpCep ? 'Buscando...' : 'Buscar'}</span>
                        </Button>
                    </div>
                    {errors.cep && (
                        <p className="text-[11px] text-[#E11D48] font-medium flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.cep.message}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground/80">Logradouro / Rua</label>
                        <Input
                            placeholder="Rua ou Avenida"
                            {...register('street')}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground/80">Bairro</label>
                        <Input
                            placeholder="Bairro"
                            {...register('neighborhood')}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1.5">
                        <label className="text-xs font-medium text-foreground/80">Cidade</label>
                        <Input
                            placeholder="Cidade"
                            {...register('city')}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground/80">UF</label>
                        <Input
                            placeholder="SP"
                            maxLength={2}
                            {...register('state')}
                            onChange={e => setValue('state', e.target.value.toUpperCase())}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0f0f0]">
                    <Button
                        type="button"
                        variant="cancel"
                        size="default"
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="default"
                        size="default"
                        hoverLift
                        disabled={submitting || lookingUpCep}
                        className="gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Salvando...</span>
                            </>
                        ) : editingCustomer ? (
                            'Salvar Alterações'
                        ) : (
                            'Cadastrar Usuário'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
