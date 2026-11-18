import * as React from 'react';
import { QrCode, Copy, Check, ExternalLink, Download, Loader2 } from 'lucide-react';
import { Modal } from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { bookService } from '../../services/bookService';
import { Book } from '../../types';

interface BookQrModalProps {
    book: Book | null;
    isOpen: boolean;
    onClose: () => void;
}

export function BookQrModal({ book, isOpen, onClose }: BookQrModalProps) {
    const [qrImageUrl, setQrImageUrl] = React.useState<string>('');
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const [downloading, setDownloading] = React.useState(false);

    const bookPageUrl = React.useMemo(() => {
        if (!book) return '';
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
        return `${origin}/books/${book.id}`;
    }, [book]);

    React.useEffect(() => {
        if (!isOpen || !book) {
            setQrImageUrl('');
            setImageLoaded(false);
            setCopied(false);
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
        try {
            await navigator.clipboard.writeText(bookPageUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // ignora indisponibilidade de clipboard
        }
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
            <div className="flex flex-col items-center space-y-4">
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

                {/* link direto copiavel */}
                <div className="w-full flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-2">
                    <QrCode className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                    <span className="flex-1 font-mono text-[11px] text-[#525252] truncate" title={bookPageUrl}>
                        {bookPageUrl}
                    </span>
                    <button
                        type="button"
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-1 rounded-md border border-[#e5e5e5] bg-white px-2 py-1 text-[11px] font-medium text-[#171717] hover:bg-[#f5f5f5] transition-colors cursor-pointer shrink-0"
                        title="Copiar link do livro"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Copiado</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3 h-3 text-[#737373]" />
                                <span>Copiar</span>
                            </>
                        )}
                    </button>
                </div>

                {/* acoes rapidas */}
                <div className="w-full flex items-center justify-end gap-2.5 pt-3 border-t border-[#f0f0f0]">
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
