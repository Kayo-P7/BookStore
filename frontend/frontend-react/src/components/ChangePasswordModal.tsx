import * as React from 'react';
import { KeyRound, Lock, Eye, EyeOff, Check, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Modal } from './ui/modal';
import { Button, cn } from './ui/button';
import { Input } from './ui/input';
import { PasswordRequirementTracker, getInputBorderState } from './ui/password-requirement-tracker';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const { user, markPasswordChanged } = useAuth();

    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

    const [showCurrent, setShowCurrent] = React.useState(false);
    const [showNew, setShowNew] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);

    const [submitting, setSubmitting] = React.useState(false);
    const [formError, setFormError] = React.useState<string | null>(null);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!isOpen) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowCurrent(false);
            setShowNew(false);
            setShowConfirm(false);
            setFormError(null);
            setSuccessMessage(null);
        }
    }, [isOpen]);

    const hasMinLength = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[^\w\d\s|_]/.test(newPassword);
    const allRequirementsMet = hasMinLength && hasUpper && hasNumber && hasSpecial;
    const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
    const inputBorderState = getInputBorderState(newPassword);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (submitting) return;
        setFormError(null);
        setSuccessMessage(null);

        const currentTrimmed = currentPassword.trim();
        const newTrimmed = newPassword.trim();
        const confirmTrimmed = confirmPassword.trim();

        if (!currentTrimmed) {
            setFormError('Informe sua senha atual.');
            return;
        }
        if (!allRequirementsMet) {
            setFormError('A nova senha deve atender a todos os requisitos de segurança.');
            return;
        }
        if (newTrimmed !== confirmTrimmed) {
            setFormError('A confirmação da nova senha não confere.');
            return;
        }
        if (newTrimmed === currentTrimmed) {
            setFormError('A nova senha não pode ser igual à senha atual.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await authService.changePassword({
                email: user?.email,
                currentPassword: currentTrimmed,
                newPassword: newTrimmed
            });
            markPasswordChanged(response);
            setSuccessMessage('Senha alterada com sucesso!');
            setTimeout(() => {
                onClose();
            }, 900);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '';
            if (message.toLowerCase().includes('incorreta')) {
                setFormError('A senha atual informada está incorreta.');
            } else {
                setFormError(message || 'Não foi possível alterar a senha. Tente novamente.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => !submitting && onClose()}
            title="Alterar Senha"
            description="Atualize sua senha pessoal de acesso ao sistema."
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-[#e11d48] text-xs font-medium flex items-start gap-2 animate-in fade-in duration-150">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{formError}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Senha Atual</span>
                    </label>
                    <div className="relative">
                        <Input
                            type={showCurrent ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            placeholder="Digite sua senha atual"
                            required
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717] p-0.5 cursor-pointer"
                            tabIndex={-1}
                        >
                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Nova Senha</span>
                    </label>
                    <div className="relative">
                        <Input
                            type={showNew ? 'text' : 'password'}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Crie uma nova senha segura"
                            required
                            className={cn(
                                'pr-10',
                                inputBorderState === 'green' && 'border-emerald-500 bg-emerald-50/20',
                                inputBorderState === 'yellow' && 'border-amber-400 bg-amber-50/20',
                                inputBorderState === 'red' && 'border-rose-400 bg-rose-50/20'
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717] p-0.5 cursor-pointer"
                            tabIndex={-1}
                        >
                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <div className="pt-1">
                        <PasswordRequirementTracker password={newPassword} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Confirmar Nova Senha</span>
                        </span>
                        {confirmPassword.length > 0 && (
                            <span className={cn('text-[11px] font-semibold', passwordsMatch ? 'text-emerald-600' : 'text-rose-500')}>
                                {passwordsMatch ? 'Coincidem' : 'Não conferem'}
                            </span>
                        )}
                    </label>
                    <div className="relative">
                        <Input
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Repita a nova senha"
                            required
                            className={cn(
                                'pr-10',
                                confirmPassword.length > 0 &&
                                    (passwordsMatch ? 'border-emerald-500 bg-emerald-50/20' : 'border-rose-400 bg-rose-50/20')
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717] p-0.5 cursor-pointer"
                            tabIndex={-1}
                        >
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0f0f0]">
                    <Button type="button" variant="cancel" onClick={onClose} disabled={submitting}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="default"
                        hoverLift
                        disabled={submitting || !currentPassword.trim() || !allRequirementsMet || !passwordsMatch}
                        className="gap-2"
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{submitting ? 'Salvando...' : 'Salvar Nova Senha'}</span>
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
