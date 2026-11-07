import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { CustomSelect } from '../../components/ui/select';
import { Book, Customer } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { maskInteger, handleNumericKeyDown } from '../../utils/masks';

const saleSchema = z.object({
    customerId: z.string().min(1, 'Selecione um cliente cadastrado.'),
    bookId: z.string().min(1, 'Selecione um livro do catálogo.'),
    quantity: z
        .string()
        .min(1, 'Informe a quantidade desejada.')
        .refine(val => !isNaN(Number(val)) && Number(val) >= 1, 'Informe uma quantidade válida maior que zero.')
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SaleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (saleData: { customerId: number; bookId: number; quantity: number; selectedBook?: Book }) => Promise<boolean>;
    customers: Customer[];
    books: Book[];
}

export function SaleFormModal({
    isOpen,
    onClose,
    onSubmit,
    customers,
    books
}: SaleFormModalProps) {
    const [submitting, setSubmitting] = React.useState(false);
    const [formError, setFormError] = React.useState<string | null>(null);
    const isSubmittingRef = React.useRef(false);

    const {
        handleSubmit,
        control,
        watch,
        setValue,
        clearErrors,
        reset,
        formState: { errors }
    } = useForm<SaleFormData>({
        resolver: zodResolver(saleSchema),
        mode: 'onChange',
        defaultValues: {
            customerId: '',
            bookId: '',
            quantity: '1'
        }
    });

    const selectedBookId = watch('bookId');
    const quantityValue = watch('quantity');

    const selectedBook = books.find(b => String(b.id) === String(selectedBookId));
    const total = selectedBook ? Number(selectedBook.price) * (Number(quantityValue) || 0) : 0;

    React.useEffect(() => {
        setFormError(null);
        isSubmittingRef.current = false;
        if (!isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    const customerOptions = customers.map(c => ({
        value: String(c.id),
        label: `${c.name} (${c.email})`,
        description: c.phone ? `Telefone: ${c.phone}` : undefined
    }));

    const bookOptions = books.map(b => ({
        value: String(b.id),
        label: `${b.title} — ${formatCurrency(b.price)} (${b.stock} em estoque)`,
        description: [b.authors ? `Autor: ${b.authors}` : '', b.isbn ? `ISBN: ${b.isbn}` : ''].filter(Boolean).join(' • ') || undefined,
        disabled: Number(b.stock) <= 0
    }));

    async function handleFormSubmit(data: SaleFormData) {
        // bloqueio imediato contra duplo clique
        if (isSubmittingRef.current || submitting) return;

        if (selectedBook && Number(data.quantity) > Number(selectedBook.stock)) {
            setFormError(`Quantidade solicitada (${data.quantity}) excede o estoque disponível (${selectedBook.stock}).`);
            return;
        }

        isSubmittingRef.current = true;
        setSubmitting(true);
        setFormError(null);
        try {
            const success = await onSubmit({
                customerId: Number(data.customerId),
                bookId: Number(data.bookId),
                quantity: Number(data.quantity),
                selectedBook
            });
            if (success) {
                reset();
                onClose();
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Falha ao registrar venda no serviço de pedidos.';
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
            title="Registrar Nova Venda"
            description="Selecione o cliente, o livro desejado e a quantidade."
            maxWidth="max-w-md"
        >
            <form noValidate onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                {/* alerta de erro interno do modal */}
                {formError && (
                    <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-[#e11d48] text-xs flex items-center gap-2 animate-message-liquid">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80">Cliente</label>
                    <Controller
                        name="customerId"
                        control={control}
                        render={({ field }) => (
                            <CustomSelect
                                value={field.value}
                                onChange={val => {
                                    field.onChange(val);
                                    if (errors.customerId) clearErrors('customerId');
                                    setFormError(null);
                                }}
                                options={customerOptions}
                                placeholder="Selecione um cliente cadastrado"
                                searchPlaceholder="Digite o nome, e-mail ou telefone..."
                                error={Boolean(errors.customerId)}
                            />
                        )}
                    />
                    {errors.customerId && (
                        <p className="text-[11px] text-[#E11D48] font-medium flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.customerId.message}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80">Livro do Catálogo</label>
                    <Controller
                        name="bookId"
                        control={control}
                        render={({ field }) => (
                            <CustomSelect
                                value={field.value}
                                onChange={val => {
                                    field.onChange(val);
                                    if (errors.bookId) clearErrors('bookId');
                                    setFormError(null);
                                }}
                                options={bookOptions}
                                placeholder="Selecione um livro disponível"
                                searchPlaceholder="Digite o título ou autor do livro..."
                                error={Boolean(errors.bookId)}
                            />
                        )}
                    />
                    {errors.bookId && (
                        <p className="text-[11px] text-[#E11D48] font-medium flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.bookId.message}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80">Quantidade</label>
                    <Input
                        placeholder="1"
                        inputMode="numeric"
                        maxLength={4}
                        value={quantityValue || ''}
                        error={Boolean(errors.quantity)}
                        onKeyDown={handleNumericKeyDown}
                        onChange={e => {
                            const val = maskInteger(e.target.value, 4);
                            setValue('quantity', val, { shouldValidate: true });
                            if (errors.quantity) clearErrors('quantity');
                            setFormError(null);
                        }}
                    />
                    {errors.quantity && (
                        <p className="text-[11px] text-[#E11D48] font-medium flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.quantity.message}
                        </p>
                    )}
                    {selectedBook && Number(quantityValue) > Number(selectedBook.stock) && (
                        <p className="text-[11px] text-[#E11D48] font-medium flex items-center gap-1.5 mt-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            Estoque insuficiente (disponível: {selectedBook.stock} un.).
                        </p>
                    )}
                </div>

                {/* resumo do total com breakdown no padrao dub */}
                <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-[#e5e5e5] bg-[#fafafa]">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">Valor Total</span>
                        {selectedBook && (
                            <span className="text-[11px] text-[#737373]">
                                ({quantityValue || 0} × {formatCurrency(selectedBook.price)})
                            </span>
                        )}
                    </div>
                    <span className="text-lg font-bold tracking-tight text-[#171717] font-mono">
                        {formatCurrency(total)}
                    </span>
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
                        disabled={submitting}
                        className="gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Registrando...</span>
                            </>
                        ) : (
                            'Confirmar Pedido'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
