import * as React from 'react';
import { User, Barcode, Building2, Package, FileText, Hash } from 'lucide-react';
import { Modal } from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Book } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface BookViewModalProps {
    book: Book | null;
    isOpen: boolean;
    onClose: () => void;
}

export function BookViewModal({ book, isOpen, onClose }: BookViewModalProps) {
    if (!book) return null;

    const inStock = Number(book.stock) > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Informações do Livro"
            description="Visualização detalhada dos dados cadastrados deste título no catálogo."
            maxWidth="max-w-lg"
        >
            <div className="pt-4 space-y-4">
                {/* identificacao principal */}
                <div className="space-y-2 pb-4 border-b border-[#f0f0f0]">
                    <div className="flex items-center gap-2 text-xs">
                        <span className={`font-semibold ${inStock ? 'text-emerald-600' : 'text-[#737373]'}`}>
                            {inStock ? 'Disponível em estoque' : 'Esgotado'}
                        </span>
                        <span className="text-[#d4d4d4]">•</span>
                        <span className="inline-flex items-center gap-0.5 font-mono text-[#737373]">
                            <Hash className="w-3 h-3" />
                            {book.id}
                        </span>
                    </div>

                    <h4 className="text-lg sm:text-xl font-bold tracking-tight text-[#171717] leading-snug">
                        {book.title}
                    </h4>

                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#525252]">
                        <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium">{book.authors || 'Autor não informado'}</span>
                    </div>
                </div>

                {/* indicadores financeiros e de acervo */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3.5">
                        <span className="block text-[11px] font-semibold uppercase tracking-wider font-mono text-[#737373]">
                            Preço Unitário
                        </span>
                        <span className="block text-xl font-extrabold font-mono text-[#059669] mt-1">
                            {formatCurrency(book.price)}
                        </span>
                    </div>

                    <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3.5">
                        <span className="block text-[11px] font-semibold uppercase tracking-wider font-mono text-[#737373]">
                            Estoque Atual
                        </span>
                        <span className="block text-xl font-extrabold font-mono text-[#171717] mt-1">
                            {book.stock}{' '}
                            <span className="text-xs font-normal text-[#737373]">
                                {Number(book.stock) === 1 ? 'exemplar' : 'exemplares'}
                            </span>
                        </span>
                    </div>
                </div>

                {/* metadados editoriais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-[#e5e5e5] bg-white p-3.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                        <Barcode className="w-4 h-4 text-[#737373] mt-0.5 shrink-0" />
                        <div className="min-w-0">
                            <span className="block text-[11px] font-semibold uppercase tracking-wider font-mono text-[#737373]">
                                ISBN
                            </span>
                            <span className="block text-xs font-mono font-medium text-[#171717] mt-0.5 break-all">
                                {book.isbn || 'Não informado'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-start gap-2.5 min-w-0">
                        <Building2 className="w-4 h-4 text-[#737373] mt-0.5 shrink-0" />
                        <div className="min-w-0">
                            <span className="block text-[11px] font-semibold uppercase tracking-wider font-mono text-[#737373]">
                                Editora
                            </span>
                            <span className="block text-xs font-medium text-[#171717] mt-0.5 break-words">
                                {book.publisher || 'Não informada'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-start gap-2.5 min-w-0 sm:col-span-2 pt-2 border-t border-[#f5f5f5]">
                        <Package className="w-4 h-4 text-[#737373] mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <span className="block text-[11px] font-semibold uppercase tracking-wider font-mono text-[#737373]">
                                    Disponibilidade
                                </span>
                                <span className="block text-xs font-medium text-[#171717] mt-0.5">
                                    {inStock ? `${book.stock} un. pronta entrega` : 'Sem estoque no momento'}
                                </span>
                            </div>
                            {book.createdAt && (
                                <div className="sm:text-right">
                                    <span className="block text-[11px] font-semibold uppercase tracking-wider font-mono text-[#737373]">
                                        Cadastrado em
                                    </span>
                                    <span className="block text-xs font-mono text-[#525252] mt-0.5">
                                        {formatDate(book.createdAt)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* sinopse / descricao */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider font-mono text-[#737373]">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sinopse & Descrição</span>
                    </div>
                    <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3.5 max-h-40 overflow-y-auto">
                        <p className="text-xs text-[#525252] leading-relaxed whitespace-pre-line">
                            {book.description?.trim()
                                ? book.description
                                : 'Nenhuma descrição adicional cadastrada para este livro no catálogo.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end pt-3 border-t border-[#f0f0f0]">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Fechar
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
