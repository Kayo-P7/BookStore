import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './modal';
import { Button } from './button';

export interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    loading = false
}: ConfirmDialogProps) {
    const isConfirmingRef = React.useRef(false);

    React.useEffect(() => {
        isConfirmingRef.current = false;
    }, [isOpen]);

    function handleConfirmClick() {
        if (isConfirmingRef.current || loading) return;
        isConfirmingRef.current = true;
        onConfirm();
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title={title}
            maxWidth="max-w-md"
            centerTitle
        >
            <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-[#e11d48]">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#e11d48]" />
                    <p className="text-xs text-[#525252] leading-relaxed">{description}</p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0f0f0]">
                    <Button
                        type="button"
                        variant="cancel"
                        size="default"
                        onClick={onCancel}
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
                    >
                        {loading ? 'Processando...' : confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
