import * as React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {authError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-[#E11D48] text-xs font-medium flex items-start gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                </div>
            )}

            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    <span>E-mail Corporativo</span>
                </label>
                <Input
                    type="email"
                    placeholder="seu.email@empresa.com"
                    error={Boolean(errors.email)}
                    {...register('email')}
                />
                {errors.email && (
                    <p className="text-[11px] text-[#E11D48] font-medium flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-primary" />
                        <span>Senha de Acesso</span>
                    </label>
                    <Link
                        to="/auth/forgot-password"
                        className="text-[11px] font-medium text-primary hover:underline"
                    >
                        Esqueceu?
                    </Link>
                </div>
                <Input
                    type="password"
                    placeholder="Sua senha de acesso"
                    error={Boolean(errors.password)}
                    {...register('password')}
                />
                {errors.password && (
                    <p className="text-[11px] text-[#E11D48] font-medium flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
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
                className="w-full mt-2 font-semibold shadow-2xs hover:shadow-xs"
            >
                <LogIn className="w-4 h-4" />
                {submitting ? 'Autenticando...' : 'Acessar Painel'}
            </Button>

            <div className="text-center pt-2">
                <span className="text-[11px] text-muted-foreground">
                    Acesso restrito a operadores autenticados da livraria.
                </span>
            </div>
        </form>
    );
}
