import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './modal';
import { Button, cn } from './button';

export interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
    onClose?: () => void;
    loading?: boolean;
    destructive?: boolean;
    variant?: 'destructive' | 'warning';
}

export function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    onClose,
    loading = false,
    variant = 'destructive'
}: ConfirmDialogProps) {
    const isConfirmingRef = React.useRef(false);
    const handleCancel = React.useCallback(() => {
        if (loading) return;
        if (onCancel) {
            onCancel();
        } else if (onClose) {
            onClose();
        }
    }, [loading, onCancel, onClose]);

    React.useEffect(() => {
        if (!isOpen) {
            isConfirmingRef.current = false;
        }
    }, [isOpen]);

    async function handleConfirmClick() {
        if (isConfirmingRef.current || loading) return;
        isConfirmingRef.current = true;
        try {
            await onConfirm();
        } finally {
            isConfirmingRef.current = false;
        }
    }

    const isWarning = variant === 'warning';

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            title={title}
            maxWidth="max-w-md"
            centerTitle
        >
            <div className="space-y-4">
                <div
                    className={cn(
                        'flex items-start gap-3.5 p-3.5 rounded-lg border',
                        isWarning
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-rose-50 border-rose-200 text-[#e11d48]'
                    )}
                >
                    <AlertTriangle
                        className={cn(
                            'w-5 h-5 shrink-0 mt-0.5',
                            isWarning ? 'text-amber-600' : 'text-[#e11d48]'
                        )}
                    />
                    <p className="text-xs text-[#525252] leading-relaxed">{description}</p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0f0f0]">
                    <Button
                        type="button"
                        variant="outline"
                        size="default"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        size="default"
                        hoverLift
                        onClick={handleConfirmClick}
                        disabled={loading}
                        className={isWarning ? 'bg-amber-600 hover:bg-amber-700 text-white' : undefined}
                    >
                        {loading ? 'Processando...' : confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
