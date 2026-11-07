import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from './button';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    maxWidth?: string;
    centerTitle?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    maxWidth = 'max-w-lg',
    centerTitle = false
}: ModalProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        }
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-dialog-fade">
            {/* backdrop dub refero: overlay escurecido em 100% da viewport */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity cursor-pointer"
                onClick={onClose}
            />

            {/* container modal dub refero: branco solido, borda hairline #e5e5e5, centralizado na tela */}
            <div
                className={cn(
                    'relative w-full z-10 bg-white border border-[#e5e5e5] rounded-2xl p-6 sm:p-7',
                    'shadow-2xl shadow-black/10 animate-dialog-pop max-h-[90vh] overflow-y-auto',
                    maxWidth
                )}
            >
                <div
                    className={cn(
                        'pb-4 border-b border-[#f0f0f0]',
                        centerTitle ? 'relative text-center px-8' : 'flex items-start justify-between'
                    )}
                >
                    <div className={cn('space-y-1', centerTitle && 'mx-auto text-center')}>
                        <h3 className={cn('text-lg font-semibold tracking-tight text-[#171717]', centerTitle && 'text-center')}>
                            {title}
                        </h3>
                        {description && (
                            <p className={cn('text-xs text-[#737373] leading-relaxed', centerTitle && 'text-center')}>
                                {description}
                            </p>
                        )}
                    </div>

                    {/* botao fechar 'x' sempre vermelho conforme diretriz de ui */}
                    <button
                        type="button"
                        onClick={onClose}
                        className={cn(
                            'text-red-500 hover:text-red-700 p-1.5 rounded-lg bg-red-50/70 hover:bg-red-100 border border-red-200/60 transition-all duration-150 hover:rotate-90 active:scale-90 cursor-pointer',
                            centerTitle ? 'absolute right-0 top-0' : '-mr-1 -mt-1'
                        )}
                        title="Fechar (Esc)"
                    >
                        <X className="w-4.5 h-4.5" />
                    </button>
                </div>

                <div className="pt-5">{children}</div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
