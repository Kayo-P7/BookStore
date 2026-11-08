import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Informe seu endereço de e-mail.')
        .email('Informe um e-mail válido.'),
    password: z
        .string()
        .min(1, 'Informe sua senha de acesso.')
        .min(6, 'A senha deve conter pelo menos 6 caracteres.')
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [submitting, setSubmitting] = React.useState(false);
    const [authError, setAuthError] = React.useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
            password: ''
        }
    });

    async function onSubmit(data: LoginFormData) {
        setSubmitting(true);
        setAuthError(null);
        try {
            await login({ email: data.email, password: data.password });
            const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '';
            if (message.includes('401') || message.toLowerCase().includes('bad credentials')) {
                setAuthError('E-mail ou senha incorretos. Verifique suas credenciais de acesso.');
            } else if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
                setAuthError('Serviço de autenticação temporariamente indisponível. Verifique sua conexão.');
            } else {
                setAuthError(message || 'Não foi possível concluir a autenticação. Tente novamente.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {authError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-[#E11D48] text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-[#171717] flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>E-mail Corporativo</span>
                </label>
                <Input
                    type="email"
                    placeholder="seu.email@empresa.com"
                    error={Boolean(errors.email)}
                    className="h-12 px-4 text-sm sm:text-base rounded-xl"
                    {...register('email')}
                />
                {errors.email && (
                    <p className="text-xs text-[#E11D48] font-medium flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-[#171717] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span>Senha de Acesso</span>
                </label>
                <Input
                    type="password"
                    placeholder="Sua senha de acesso"
                    error={Boolean(errors.password)}
                    className="h-12 px-4 text-sm sm:text-base rounded-xl"
                    {...register('password')}
                />
                {errors.password && (
                    <p className="text-xs text-[#E11D48] font-medium flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.password.message}
                    </p>
                )}
            </div>

            <Button
                type="submit"
                variant="default"
                size="lg"
                hoverLift
                disabled={submitting}
                className="w-full h-12 mt-3 text-sm sm:text-base font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all gap-2"
            >
                <LogIn className="w-4 h-4" />
                {submitting ? 'Autenticando...' : 'Acessar Painel'}
            </Button>

            <div className="text-center pt-2">
                <span className="text-xs text-[#737373]">
                    Acesso restrito a operadores autenticados da livraria.
                </span>
            </div>
        </form>
    );
}
