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
    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title={title}
            maxWidth="max-w-md"
        >
            <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-destructive" />
                    <p className="text-xs text-foreground leading-relaxed">{description}</p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/50">
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
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Processando...' : confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
