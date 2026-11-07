import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Book } from '../../types';
import { maskMoney, parseMoney, maskInteger, handleNumericKeyDown } from '../../utils/masks';

const bookSchema = z.object({
    title: z.string().min(1, 'Informe o título do livro.'),
    authors: z.string().optional(),
    price: z
        .string()
        .min(1, 'Informe o preço unitário.')
        .refine(val => parseMoney(val) > 0, 'Informe um preço válido maior que zero (ex: R$ 49,90).'),
    stock: z
        .string()
        .min(1, 'Informe a quantidade em estoque.')
        .refine(val => val !== '' && !isNaN(Number(val)) && Number(val) >= 0, 'Informe uma quantidade válida maior ou igual a zero.')
});

type BookFormData = z.infer<typeof bookSchema>;

interface BookFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (bookData: Omit<Book, 'id'>) => Promise<boolean>;
}

export function BookFormModal({ isOpen, onClose, onSubmit }: BookFormModalProps) {
    const [submitting, setSubmitting] = React.useState(false);
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
    } = useForm<BookFormData>({
        resolver: zodResolver(bookSchema),
        mode: 'onChange',
        defaultValues: {
            title: '',
            authors: '',
            price: '',
            stock: ''
        }
    });

    const priceValue = watch('price');
    const stockValue = watch('stock');

    React.useEffect(() => {
        setFormError(null);
        isSubmittingRef.current = false;
        if (!isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    async function handleFormSubmit(data: BookFormData) {
        // bloqueio imediato contra duplo clique
        if (isSubmittingRef.current || submitting) return;

        isSubmittingRef.current = true;
        setSubmitting(true);
        setFormError(null);
        try {
            const numericPrice = parseMoney(data.price);
            const numericStock = parseInt(data.stock, 10);
            const success = await onSubmit({
                title: data.title.trim(),
                authors: data.authors?.trim() || '',
                price: numericPrice,
                stock: isNaN(numericStock) ? 0 : numericStock
            });
            if (success) {
                reset();
                onClose();
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Falha ao salvar livro no catálogo.';
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
            title="Novo Livro no Catálogo"
            description="Preencha os dados do título para cadastrar no inventário."
            maxWidth="max-w-md"
        >
            <form noValidate onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                {/* alerta de erro interno do modal */}
                {formError && (
                    <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-[#e11d48] text-xs flex items-center gap-2 animate-in fade-in duration-150">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80">Título do Livro</label>
                    <Input
                        placeholder="Ex: O Pequeno Príncipe"
                        error={Boolean(errors.title)}
                        {...register('title', {
                            onChange: () => {
                                if (errors.title) clearErrors('title');
                            }
                        })}
                    />
                    {errors.title && (
                        <p className="text-[11px] text-[#E11D48] font-medium flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.title.message}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80">Autor(es)</label>
                    <Input
                        placeholder="Ex: Antoine de Saint-Exupéry"
                        {...register('authors')}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground/80">Preço Unitário</label>
                        <Input
                            placeholder="R$ 0,00"
                            inputMode="numeric"
                            value={priceValue || ''}
                            error={Boolean(errors.price)}
                            onKeyDown={handleNumericKeyDown}
                            onChange={e => {
                                const { formatted } = maskMoney(e.target.value);
                                setValue('price', formatted, { shouldValidate: true });
                                if (errors.price) clearErrors('price');
                            }}
                        />
                        {errors.price && (
                            <p className="text-[11px] text-[#E11D48] font-medium flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {errors.price.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground/80">Estoque Inicial</label>
                        <Input
                            placeholder="0"
                            inputMode="numeric"
                            maxLength={6}
                            value={stockValue || ''}
                            error={Boolean(errors.stock)}
                            onKeyDown={handleNumericKeyDown}
                            onChange={e => {
                                const val = maskInteger(e.target.value, 6);
                                setValue('stock', val, { shouldValidate: true });
                                if (errors.stock) clearErrors('stock');
                            }}
                        />
                        {errors.stock && (
                            <p className="text-[11px] text-[#E11D48] font-medium flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {errors.stock.message}
                            </p>
                        )}
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
                        disabled={submitting}
                        className="gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Cadastrando...</span>
                            </>
                        ) : (
                            'Cadastrar Livro'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
