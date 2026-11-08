import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Lock, Eye, EyeOff, Check, AlertCircle, ArrowRight, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import {
    PasswordRequirementTracker,
    getInputBorderState
} from '../../components/ui/password-requirement-tracker';
import { cn } from '../../components/ui/button';

export function PrimeiroAcessoPage() {
    const navigate = useNavigate();
    const { user, logout, markPasswordChanged } = useAuth();

    const [senhaAtual, setSenhaAtual] = React.useState('');
    const [novaSenha, setNovaSenha] = React.useState('');
    const [confirmarSenha, setConfirmarSenha] = React.useState('');

    const [showSenhaAtual, setShowSenhaAtual] = React.useState(false);
    const [showNovaSenha, setShowNovaSenha] = React.useState(false);
    const [showConfirmarSenha, setShowConfirmarSenha] = React.useState(false);

    const [submitting, setSubmitting] = React.useState(false);
    const [formError, setFormError] = React.useState<string | null>(null);

    // calculo dos criterios da nova senha
    const upperCount = (novaSenha.match(/[A-Z]/g) || []).length;
    const numberCount = (novaSenha.match(/\d/g) || []).length;
    const specialCount = (novaSenha.match(/[^\w\d\s|_]/g) || []).length;

    const hasMinLength = novaSenha.length >= 8;
    const hasUpper = upperCount >= 1;
    const hasNumber = numberCount >= 1;
    const hasSpecial = specialCount >= 1;

    const allRequirementsMet = hasMinLength && hasUpper && hasNumber && hasSpecial;
    const passwordsMatch = novaSenha.length > 0 && novaSenha === confirmarSenha;
    const inputBorderState = getInputBorderState(novaSenha);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);

        const currentTrimmed = senhaAtual.trim();
        const newTrimmed = novaSenha.trim();
        const confirmTrimmed = confirmarSenha.trim();

        if (!currentTrimmed) {
            setFormError('Informe sua senha provisória atual.');
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
            setFormError('A nova senha não pode ser idêntica à senha anterior.');
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
            navigate('/dashboard', { replace: true });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '';
            if (message.includes('incorreta') || message.includes('400')) {
                setFormError('A senha provisória atual informada está incorreta. Verifique suas credenciais.');
            } else {
                setFormError(message || 'Não foi possível atualizar a senha. Tente novamente.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#fafafa] text-[#171717] bg-grid-pattern">
            {/* container central adaptado a estetica moderna da livraria */}
            <div className="relative z-10 w-full max-w-[520px] my-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-white rounded-3xl p-7 sm:p-10 border border-[#e5e5e5] shadow-2xl shadow-black/6">
                    {/* cabecalho com identidade visual bookstore */}
                    <div className="flex flex-col items-center text-center mb-7">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 mb-3.5 ring-4 ring-emerald-500/10">
                            <KeyRound className="w-7 h-7" />
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 mb-2">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Primeiro Acesso • Segurança Operacional</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717]">
                            Cadastre sua Senha Pessoal
                        </h1>
                        <p className="text-xs sm:text-sm text-[#737373] mt-1.5 max-w-md leading-relaxed">
                            {user?.name ? `Olá, ${user.name.split(' ')[0]}! ` : ''}
                            Substitua sua credencial provisória por uma senha definitiva para liberar o acesso ao BookStore.
                        </p>
                    </div>

                    {/* feedback de erro */}
                    {formError && (
                        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-[#E11D48] text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* senha provisoria atual */}
                        <div className="space-y-1.5">
                            <label className="text-xs sm:text-sm font-semibold text-[#171717] flex items-center gap-2">
                                <Lock className="w-4 h-4 text-emerald-600" />
                                <span>Senha Provisória Atual</span>
                            </label>
                            <div className="relative">
                                <Input
                                    type={showSenhaAtual ? 'text' : 'password'}
                                    value={senhaAtual}
                                    onChange={e => setSenhaAtual(e.target.value)}
                                    placeholder="Digite sua senha provisória"
                                    required
                                    autoFocus
                                    className="h-11 sm:h-12 px-4 pr-10 text-sm rounded-xl"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSenhaAtual(prev => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717] p-1 transition-colors cursor-pointer"
                                    title={showSenhaAtual ? 'Ocultar senha' : 'Exibir senha'}
                                    tabIndex={-1}
                                >
                                    {showSenhaAtual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* nova senha com validador progressivo estilo wisis */}
                        <div className="space-y-1.5">
                            <label className="text-xs sm:text-sm font-semibold text-[#171717] flex items-center gap-2">
                                <KeyRound className="w-4 h-4 text-emerald-600" />
                                <span>Nova Senha Definitiva</span>
                            </label>
                            <div className="relative">
                                <Input
                                    type={showNovaSenha ? 'text' : 'password'}
                                    value={novaSenha}
                                    onChange={e => setNovaSenha(e.target.value)}
                                    placeholder="Crie sua nova senha forte"
                                    required
                                    className={cn(
                                        'h-11 sm:h-12 px-4 pr-10 text-sm rounded-xl transition-all duration-200',
                                        inputBorderState === 'green' &&
                                            'border-emerald-500 bg-emerald-50/20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20',
                                        inputBorderState === 'yellow' &&
                                            'border-amber-400 bg-amber-50/20 focus-visible:border-amber-400 focus-visible:ring-amber-400/20',
                                        inputBorderState === 'red' &&
                                            'border-rose-400 bg-rose-50/20 focus-visible:border-rose-400 focus-visible:ring-rose-400/20'
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNovaSenha(prev => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717] p-1 transition-colors cursor-pointer"
                                    title={showNovaSenha ? 'Ocultar senha' : 'Exibir senha'}
                                    tabIndex={-1}
                                >
                                    {showNovaSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* frase fluida de requisitos progressivos */}
                            <div className="pt-1">
                                <PasswordRequirementTracker password={novaSenha} />
                            </div>
                        </div>

                        {/* confirmar nova senha */}
                        <div className="space-y-1.5">
                            <label className="text-xs sm:text-sm font-semibold text-[#171717] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    <span>Confirmar Nova Senha</span>
                                </div>
                                {confirmarSenha.length > 0 && (
                                    <span
                                        className={cn(
                                            'text-[11px] font-semibold transition-colors',
                                            passwordsMatch ? 'text-emerald-600' : 'text-rose-500'
                                        )}
                                    >
                                        {passwordsMatch ? 'As senhas coincidem' : 'As senhas não conferem'}
                                    </span>
                                )}
                            </label>
                            <div className="relative">
                                <Input
                                    type={showConfirmarSenha ? 'text' : 'password'}
                                    value={confirmarSenha}
                                    onChange={e => setConfirmarSenha(e.target.value)}
                                    placeholder="Repita a nova senha criada"
                                    required
                                    className={cn(
                                        'h-11 sm:h-12 px-4 pr-10 text-sm rounded-xl transition-all duration-200',
                                        confirmarSenha.length > 0 &&
                                            (passwordsMatch
                                                ? 'border-emerald-500 bg-emerald-50/20'
                                                : 'border-rose-400 bg-rose-50/20')
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmarSenha(prev => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717] p-1 transition-colors cursor-pointer"
                                    title={showConfirmarSenha ? 'Ocultar senha' : 'Exibir senha'}
                                    tabIndex={-1}
                                >
                                    {showConfirmarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* botao de acao */}
                        <Button
                            type="submit"
                            variant="default"
                            size="lg"
                            hoverLift
                            disabled={submitting || !allRequirementsMet || !passwordsMatch}
                            className="w-full h-11 sm:h-12 mt-2 text-sm sm:text-base font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all gap-2 disabled:opacity-50"
                        >
                            <span>{submitting ? 'Atualizando Senha...' : 'Salvar Senha e Entrar no Painel'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </form>

                    {/* rodape de troca de operador */}
                    <div className="mt-6 pt-4 border-t border-[#f0f0f0] text-center">
                        <button
                            type="button"
                            onClick={() => {
                                logout();
                                navigate('/auth/login', { replace: true });
                            }}
                            className="inline-flex items-center gap-1.5 text-xs text-[#737373] hover:text-rose-600 transition-colors font-medium cursor-pointer"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>
                                Conectado como <strong className="text-[#171717]">{user?.email || 'operador'}</strong> • Sair da conta
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
