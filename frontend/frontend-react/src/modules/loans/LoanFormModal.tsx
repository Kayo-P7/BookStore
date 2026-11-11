import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { CustomSelect } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Book, BookLoanInventory, Customer } from '../../types';

const schema = z.object({
    customerId: z.string().min(1, 'Selecione um cliente.'),
    bookId: z.string().min(1, 'Selecione um livro.'),
    dueDate: z.string().min(1, 'Informe a data prevista para devolução.')
});

type FormData = z.infer<typeof schema>;

interface LoanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { customerId: number; bookId: number; dueDate: string }) => Promise<boolean>;
    customers: Customer[];
    books: Book[];
    inventories: BookLoanInventory[];
}

function localDateString(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function LoanFormModal({ isOpen, onClose, onSubmit, customers, books, inventories }: LoanFormModalProps) {
    const [submitting, setSubmitting] = React.useState(false);
    const [formError, setFormError] = React.useState<string | null>(null);
    const { handleSubmit, control, watch, reset, clearErrors, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: { customerId: '', bookId: '', dueDate: '' }
    });

    React.useEffect(() => {
        if (!isOpen) {
            reset();
            setFormError(null);
        }
    }, [isOpen, reset]);

    const selectedBookId = watch('bookId');
    const selectedBook = books.find(book => String(book.id) === selectedBookId);

    function availableCopiesFor(book: Book) {
        const inventory = inventories.find(item => item.bookId === book.id);
        return inventory ? inventory.availableCopies : Number(book.stock || 0);
    }

    const selectedBookAvailable = selectedBook ? availableCopiesFor(selectedBook) : 0;
    const customerOptions = customers.map(customer => ({
        value: String(customer.id),
        label: `${customer.name} (${customer.email})`
    }));
    const bookOptions = books.map(book => {
        const availableCopies = availableCopiesFor(book);
        return {
            value: String(book.id),
            label: book.title,
            description: `${book.authors || 'Autor não informado'} • ${availableCopies} exemplar(es) disponível(is)`,
            disabled: availableCopies <= 0
        };
    });

    async function submit(data: FormData) {
        if (submitting) return;
        setSubmitting(true);
        setFormError(null);
        try {
            const success = await onSubmit({
                customerId: Number(data.customerId),
                bookId: Number(data.bookId),
                dueDate: data.dueDate
            });
            if (success) {
                reset();
                onClose();
            }
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'Não foi possível registrar o empréstimo.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Novo empréstimo"
            description="Selecione o cliente, o livro e a data prevista para devolução." maxWidth="max-w-md">
            <form noValidate onSubmit={handleSubmit(submit)} className="space-y-4">
                {formError && <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />{formError}
                </div>}

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80">Cliente</label>
                    <Controller name="customerId" control={control} render={({ field }) => (
                        <CustomSelect value={field.value} onChange={value => { field.onChange(value); clearErrors('customerId'); setFormError(null); }}
                            options={customerOptions} placeholder="Selecione um cliente" searchPlaceholder="Buscar cliente..."
                            error={Boolean(errors.customerId)} />
                    )} />
                    {errors.customerId && <p className="text-[11px] text-rose-600">{errors.customerId.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80">Livro</label>
                    <Controller name="bookId" control={control} render={({ field }) => (
                        <CustomSelect value={field.value} onChange={value => { field.onChange(value); clearErrors('bookId'); setFormError(null); }}
                            options={bookOptions} placeholder="Selecione um livro disponível" searchPlaceholder="Buscar livro..."
                            error={Boolean(errors.bookId)} />
                    )} />
                    {errors.bookId && <p className="text-[11px] text-rose-600">{errors.bookId.message}</p>}
                    {selectedBook && <p className="text-[11px] text-muted-foreground">Exemplares disponíveis para empréstimo: {selectedBookAvailable} unidade(s).</p>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80">Previsão de devolução</label>
                    <Controller name="dueDate" control={control} render={({ field }) => (
                        <Input type="date" min={localDateString(new Date())} {...field}
                            onChange={event => { field.onChange(event); clearErrors('dueDate'); setFormError(null); }}
                            error={Boolean(errors.dueDate)} />
                    )} />
                    {errors.dueDate && <p className="text-[11px] text-rose-600">{errors.dueDate.message}</p>}
                </div>

                <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
                    <Button type="submit" disabled={submitting || customers.length === 0 || bookOptions.every(option => option.disabled)}>
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        {submitting ? 'Registrando...' : 'Registrar empréstimo'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
