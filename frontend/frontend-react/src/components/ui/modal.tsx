import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from './button';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    maxWidth = 'max-w-lg'
}: ModalProps) {
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-dialog-fade">
            {/* backdrop com desfoque e fade suave apple easing (260ms) */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity cursor-pointer"
                onClick={onClose}
            />

            {/* container com glassmorphism e pop suave apple easing (280ms) */}
            <div
                className={cn(
                    'relative w-full z-10 glass-card rounded-2xl p-6 sm:p-7 shadow-2xl border border-white/20 dark:border-white/10',
                    'animate-dialog-pop max-h-[90vh] overflow-y-auto',
                    maxWidth
                )}
            >
                <div className="flex items-start justify-between pb-4 border-b border-border/50">
                    <div>
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
                        {description && (
                            <p className="text-sm text-muted-foreground mt-1">{description}</p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 p-1.5 rounded-lg transition-all duration-200 hover:rotate-90 active:scale-90 cursor-pointer"
                        title="Fechar (Esc)"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="pt-5">{children}</div>
            </div>
        </div>
    );
}
