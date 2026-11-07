import React, { useEffect } from 'react';

// modal de confirmacao no padrao shadcn com apple easing e cancelamento em vermelho
export function ConfirmDialog({
    isOpen,
    title = 'Confirmar Ação',
    description = 'Tem certeza que deseja prosseguir com esta ação?',
    confirmText = 'Confirmar Exclusão',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    loading = false
}) {
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape' && isOpen) {
                onCancel();
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
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div className="dialog-backdrop animate-dialog-fade" onClick={onCancel}>
            <div
                className="dialog-container animate-dialog-pop"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="dialog-header">
                    <div className="dialog-title-row">
                        <div className="dialog-icon-badge">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h3>{title}</h3>
                    </div>
                    <button
                        type="button"
                        className="dialog-close-btn"
                        onClick={onCancel}
                        aria-label="Fechar"
                    >
                        ×
                    </button>
                </div>

                <p className="dialog-body">{description}</p>

                <div className="dialog-footer">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className="btn-destructive"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Processando...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
