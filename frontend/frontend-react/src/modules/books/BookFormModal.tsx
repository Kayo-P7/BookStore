import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    AlertCircle,
    Loader2,
    Search,
    BookOpen,
    Check,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Modal } from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Book, GoogleBookItem } from '../../types';
import { maskMoney, parseMoney, maskInteger, handleNumericKeyDown } from '../../utils/masks';
import { bookService } from '../../services/bookService';
import { normalizeGoogleBook, NormalizedGoogleBook } from '../../utils/googleBooksNormalizer';

const bookSchema = z.object({
    title: z.string().min(1, 'Informe o título do livro.'),
    authors: z.string().optional(),
    isbn: z.string().optional(),
    publisher: z.string().optional(),
    description: z.string().optional(),
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

    // estados da integracao com google books
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isSearching, setIsSearching] = React.useState(false);
    const [searchResults, setSearchResults] = React.useState<NormalizedGoogleBook[]>([]);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [selectedGoogleBook, setSelectedGoogleBook] = React.useState<NormalizedGoogleBook | null>(null);
    const [showExtraDetails, setShowExtraDetails] = React.useState(false);

    const priceInputRef = React.useRef<HTMLInputElement | null>(null);

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
            isbn: '',
            publisher: '',
            description: '',
            price: '',
            stock: ''
        }
    });

    const priceValue = watch('price');
    const stockValue = watch('stock');

    // reinicializa estados ao fechar ou reabrir o modal
    React.useEffect(() => {
        setFormError(null);
        isSubmittingRef.current = false;
        if (!isOpen) {
            reset();
            setSearchQuery('');
            setSearchResults([]);
            setHasSearched(false);
            setSelectedGoogleBook(null);
            setShowExtraDetails(false);
        }
    }, [isOpen, reset]);

    // consulta a api do google books (com fallback transparente para open library se necessario)
    async function handleSearchGoogleBooks(e?: React.FormEvent) {
        if (e) e.preventDefault();
        const query = searchQuery.trim();
        if (!query) return;

        setIsSearching(true);
        setHasSearched(true);
        setSelectedGoogleBook(null);
        setFormError(null);

        try {
            const data = await bookService.searchGoogleBooks(query);
            if (data && Array.isArray(data.items)) {
                const normalized = (data.items as GoogleBookItem[]).map(normalizeGoogleBook);
                setSearchResults(normalized);
            } else {
                setSearchResults([]);
            }
        } catch {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }

    // preenche automaticamente os campos com o livro selecionado
    function handleSelectBook(book: NormalizedGoogleBook) {
        setSelectedGoogleBook(book);
        setValue('title', book.title, { shouldValidate: true });
        setValue('authors', book.authors, { shouldValidate: true });
        setValue('isbn', book.isbn || '');
        setValue('publisher', book.publisher || '');
        setValue('description', book.description || '');

        clearErrors(['title', 'authors']);
        setSearchResults([]);
        setHasSearched(false);

        if (book.isbn || book.publisher || book.description) {
            setShowExtraDetails(true);
        }

        // foca automaticamente no preco para preenchimento manual rapido
        setTimeout(() => {
            if (priceInputRef.current) {
                priceInputRef.current.focus();
            }
        }, 120);
    }

    // desvincula os dados do google books mantendo os campos editaveis
    function handleClearSelection() {
        setSelectedGoogleBook(null);
        setSearchQuery('');
        setSearchResults([]);
        setHasSearched(false);
    }

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
                isbn: data.isbn?.trim() || '',
                publisher: data.publisher?.trim() || '',
                description: data.description?.trim() || '',
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
            description="Consulte na base do Google Books para preencher automaticamente ou cadastre manualmente."
            maxWidth="max-w-lg"
        >
            <div className="space-y-4">
                {/* alerta de erro geral do modal */}
                {formError && (
                    <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-[#e11d48] text-xs flex items-center gap-2 animate-message-liquid">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                    </div>
                )}

                {/* secao de consulta externa: google books */}
                <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-[#171717] flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-[#059669]" />
                            <span className="font-semibold">Buscar no Google Books</span>
                            <span className="text-[11px] font-normal text-[#737373]">(opcional)</span>
                        </label>
                        {selectedGoogleBook && (
                            <button
                                type="button"
                                onClick={handleClearSelection}
                                className="text-[11px] text-[#737373] hover:text-[#e11d48] transition-colors"
                            >
                                Limpar seleção
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSearchGoogleBooks} className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                placeholder="Digite título ou ISBN (ex: Clean Code, 9780132350884)..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pr-8 text-xs bg-white"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSearchResults([]);
                                        setHasSearched(false);
                                    }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717] p-0.5"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="default"
                            size="sm"
                            disabled={isSearching || !searchQuery.trim()}
                            className="gap-1.5 shrink-0 px-3"
                        >
                            {isSearching ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Search className="w-3.5 h-3.5" />
                            )}
                            <span>Buscar</span>
                        </Button>
                    </form>

                    {/* feedback visual de livro selecionado do google com orientacao amigavel */}
                    {selectedGoogleBook && (
                        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-xs text-[#059669] animate-message-liquid">
                            {selectedGoogleBook.thumbnail ? (
                                <img
                                    src={selectedGoogleBook.thumbnail}
                                    alt={selectedGoogleBook.title}
                                    className="w-8 h-12 object-cover rounded shadow-2xs shrink-0"
                                />
                            ) : (
                                <div className="w-8 h-12 rounded bg-emerald-100 flex items-center justify-center shrink-0">
                                    <BookOpen className="w-4 h-4 text-[#059669]" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-1.5 font-semibold truncate">
                                    <Check className="w-3.5 h-3.5 shrink-0 text-[#059669]" />
                                    <span className="truncate">{selectedGoogleBook.title}</span>
                                </div>
                                <p className="text-[11px] text-[#059669]/90 truncate">
                                    {selectedGoogleBook.authors || 'Autor não informado'} {selectedGoogleBook.publishedYear ? `• ${selectedGoogleBook.publishedYear}` : ''}
                                </p>
                                <p className="text-[11px] text-[#047857] pt-1 border-t border-emerald-200/60 leading-relaxed">
                                    Campos básicos preenchidos via Google Books. Por favor, complete os campos restantes (como preço e estoque) manualmente abaixo.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* lista de resultados retornados pela busca com cabecalho fixo isolado sem sobreposicao */}
                    {searchResults.length > 0 && (
                        <div className="rounded-lg border border-[#e5e5e5] bg-white shadow-sm overflow-hidden animate-message-liquid">
                            <div className="px-3.5 py-2 bg-[#fafafa] text-[11px] font-medium text-[#737373] border-b border-[#e5e5e5] flex justify-between items-center select-none">
                                <span>{searchResults.length} {searchResults.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}</span>
                                <span className="text-[10px] text-[#737373]">Clique para autopreencher</span>
                            </div>
                            <div className="max-h-52 overflow-y-auto divide-y divide-[#f0f0f0]">
                                {searchResults.map(item => (
                                    <div
                                        key={item.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleSelectBook(item)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleSelectBook(item);
                                            }
                                        }}
                                        className="p-2.5 flex items-start gap-2.5 hover:bg-emerald-50/50 cursor-pointer transition-colors group text-left"
                                    >
                                        {item.thumbnail ? (
                                            <img
                                                src={item.thumbnail}
                                                alt={item.title}
                                                className="w-8 h-11 object-cover rounded shadow-2xs shrink-0 mt-0.5"
                                            />
                                        ) : (
                                            <div className="w-8 h-11 rounded bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center shrink-0 mt-0.5">
                                                <BookOpen className="w-4 h-4 text-[#737373]" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-[#171717] group-hover:text-[#059669] transition-colors line-clamp-1">
                                                {item.title}
                                            </p>
                                            <p className="text-[11px] text-[#737373] line-clamp-1">
                                                {item.authors || 'Autor não informado'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-[10px] text-[#737373]">
                                                {item.publishedYear && <span>{item.publishedYear}</span>}
                                                {item.publisher && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="truncate max-w-[120px]">{item.publisher}</span>
                                                    </>
                                                )}
                                                {item.isbn && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="font-mono">ISBN: {item.isbn}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[11px] text-[#059669] font-medium self-center px-2 py-1 rounded bg-emerald-50 border border-emerald-200/60 opacity-90 group-hover:opacity-100 shrink-0">
                                            Selecionar
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* aviso amigavel caso nada seja encontrado na base do google */}
                    {hasSearched && !isSearching && searchResults.length === 0 && !selectedGoogleBook && (
                        <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5 animate-message-liquid">
                            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                            <div className="space-y-0.5">
                                <p className="font-medium text-amber-900">Nenhum livro localizado na base do Google Books</p>
                                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                                    Não encontramos este título na busca externa. Sem problemas! Você pode preencher todos os dados do livro manualmente nos campos abaixo.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* formulario de dados do livro (preenchimento automatico ou manual) */}
                <form noValidate onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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
                                ref={priceInputRef}
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

                    {/* campos opcionais complementares (isbn, editora, descricao) */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowExtraDetails(prev => !prev)}
                            className="text-xs font-medium text-[#737373] hover:text-[#171717] flex items-center gap-1 transition-colors"
                        >
                            <span>{showExtraDetails ? 'Ocultar detalhes extras' : '+ Detalhes adicionais (ISBN, Editora, Descrição)'}</span>
                            {showExtraDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {showExtraDetails && (
                            <div className="mt-3 space-y-3 pt-3 border-t border-[#f0f0f0] animate-in fade-in duration-200">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground/80">ISBN</label>
                                        <Input
                                            placeholder="Ex: 9780132350884"
                                            {...register('isbn')}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground/80">Editora</label>
                                        <Input
                                            placeholder="Ex: Prentice Hall"
                                            {...register('publisher')}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground/80">Descrição / Sinopse</label>
                                    <textarea
                                        placeholder="Breve resumo da obra..."
                                        rows={2}
                                        className="w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-xs text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669] placeholder:text-[#737373] resize-none"
                                        {...register('description')}
                                    />
                                </div>
                            </div>
                        )}
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
            </div>
        </Modal>
    );
}
