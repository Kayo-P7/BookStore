import * as React from 'react';
import { QrCode, Copy, Check, ExternalLink, Download, Loader2 } from 'lucide-react';
import { Modal } from '../../components/ui/modal';
import { Button, cn } from '../../components/ui/button';
import { bookService } from '../../services/bookService';
import { Book } from '../../types';

interface BookQrModalProps {
    book: Book | null;
    isOpen: boolean;
    onClose: () => void;
}

async function copyTextSafe(text: string, container?: HTMLElement | null): Promise<boolean> {
    if (typeof navigator !== 'undefined' && window.isSecureContext && navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // prossegue para fallback compativel com http/rede local
        }
    }

    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.width = '1px';
        textarea.style.height = '1px';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';

        const host = container || document.body;
        host.appendChild(textarea);
        textarea.focus({ preventScroll: true });
        textarea.select();
        textarea.setSelectionRange(0, text.length);
        const copied = document.execCommand('copy');
        host.removeChild(textarea);
        return copied;
    } catch {
        return false;
    }
}

export function BookQrModal({ book, isOpen, onClose }: BookQrModalProps) {
    const [qrImageUrl, setQrImageUrl] = React.useState<string>('');
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const [copyAnimKey, setCopyAnimKey] = React.useState(0);
    const [downloading, setDownloading] = React.useState(false);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const copyTimerRef = React.useRef<number | null>(null);

    const bookPageUrl = React.useMemo(() => {
        if (!book) return '';
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
        return `${origin}/books/${book.id}`;
    }, [book]);

    React.useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                window.clearTimeout(copyTimerRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        if (!isOpen || !book) {
            setQrImageUrl('');
            setImageLoaded(false);
            setCopied(false);
            if (copyTimerRef.current) {
                window.clearTimeout(copyTimerRef.current);
            }
            return;
        }

        let cancelled = false;
        setImageLoaded(false);
        bookService.getQrCodeUrl(book.id, window.location.origin).then(url => {
            if (!cancelled) {
                setQrImageUrl(url);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [isOpen, book]);

    async function handleCopyLink() {
        if (!bookPageUrl) return;
        const ok = await copyTextSafe(bookPageUrl, containerRef.current);
        if (!ok) return;

        if (copyTimerRef.current) {
            window.clearTimeout(copyTimerRef.current);
        }
        setCopied(true);
        setCopyAnimKey(prev => prev + 1);
        copyTimerRef.current = window.setTimeout(() => {
            setCopied(false);
        }, 2200);
    }

    async function handleDownloadQr() {
        if (!qrImageUrl || !book || downloading) return;
        setDownloading(true);
        try {
            const res = await fetch(qrImageUrl);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = blobUrl;
            anchor.download = `qrcode-livro-${book.id}.png`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(blobUrl);
        } catch {
            window.open(qrImageUrl, '_blank', 'noopener,noreferrer');
        } finally {
            setDownloading(false);
        }
    }

    if (!book) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="QR Code do Livro"
            description="Aponte a câmera do celular para abrir a ficha completa deste título."
            maxWidth="max-w-sm"
            centerTitle
        >
            <div ref={containerRef} className="flex flex-col items-center space-y-4">
                {/* identificacao do livro */}
                <div className="w-full text-center px-2">
                    <p className="text-sm font-bold text-[#171717] line-clamp-2">{book.title}</p>
                    <p className="text-xs text-[#737373] mt-0.5 truncate">
                        {book.authors || 'Autor não informado'} {book.isbn ? `• ISBN ${book.isbn}` : ''}
                    </p>
                </div>

                {/* moldura do qr code */}
                <div className="relative flex items-center justify-center w-60 h-60 rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-2xs">
                    {!imageLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-[#737373]">
                            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                            <span>Gerando QR Code...</span>
                        </div>
                    )}
                    {qrImageUrl && (
                        <img
                            src={qrImageUrl}
                            alt={`QR Code do livro ${book.title}`}
                            width={208}
                            height={208}
                            onLoad={() => setImageLoaded(true)}
                            className={`w-52 h-52 object-contain transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        />
                    )}
                </div>

                {/* link direto copiavel com confirmacao minimalista e suave */}
                <div className="w-full space-y-1.5">
                    <div
                        className={cn(
                            'w-full flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors duration-200',
                            copied
                                ? 'border-emerald-300 bg-emerald-50/40'
                                : 'border-[#e5e5e5] bg-[#fafafa]'
                        )}
                    >
                        <QrCode
                            className={cn(
                                'w-3.5 h-3.5 shrink-0 transition-colors duration-200',
                                copied ? 'text-emerald-600' : 'text-[#737373]'
                            )}
                        />
                        <span
                            onClick={handleCopyLink}
                            className="flex-1 font-mono text-[11px] text-[#525252] truncate cursor-pointer select-all"
                            title={bookPageUrl}
                        >
                            {bookPageUrl}
                        </span>
                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className={cn(
                                'inline-flex items-center justify-center gap-1.5 min-w-[78px] rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors duration-200 cursor-pointer shrink-0',
                                copied
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-[#e5e5e5] bg-white text-[#171717] hover:bg-[#f5f5f5] hover:border-[#d4d4d4]'
                            )}
                            title="Copiar link do livro"
                        >
                            {copied ? (
                                <span key={copyAnimKey} className="inline-flex items-center gap-1 animate-copy-pop">
                                    <Check className="w-3 h-3 stroke-[2.25] text-emerald-600" />
                                    <span>Copiado</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1">
                                    <Copy className="w-3 h-3 text-[#737373]" />
                                    <span>Copiar</span>
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="h-4 flex items-center justify-center">
                        {copied && (
                            <span
                                key={`msg-${copyAnimKey}`}
                                className="text-[11px] text-emerald-600 animate-copy-pop"
                            >
                                Link copiado para a área de transferência
                            </span>
                        )}
                    </div>
                </div>

                {/* acoes rapidas */}
                <div className="w-full flex items-center justify-end gap-2.5 pt-2 border-t border-[#f0f0f0]">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadQr}
                        disabled={!qrImageUrl || downloading}
                        className="flex-1 gap-1.5"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloading ? 'Baixando...' : 'Baixar PNG'}</span>
                    </Button>
                    <Button
                        type="button"
                        variant="default"
                        size="sm"
                        hoverLift
                        onClick={() => window.open(bookPageUrl, '_blank', 'noopener,noreferrer')}
                        className="flex-1 gap-1.5"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Página</span>
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
