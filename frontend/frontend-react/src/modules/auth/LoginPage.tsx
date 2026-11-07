import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Informe seu endereço de e-mail.')
        .email('Informe um e-mail válido (ex: usuario@bookstore.internal).'),
    password: z
        .string()
        .min(1, 'Informe sua senha de acesso.')
        .min(6, 'A senha deve conter pelo menos 6 caracteres.')
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
        defaultValues: {
            email: 'admin@bookstore.internal',
            password: '••••••••'
        }
    });

    async function onSubmit(_data: LoginFormData) {
        setSubmitting(true);
        // simula autenticacao rapida com transicao fluida
        await new Promise(resolve => setTimeout(resolve, 400));
        setSubmitting(false);
        navigate('/dashboard');
    }

    return (
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    <span>E-mail Corporativo</span>
                </label>
                <Input
                    type="email"
                    placeholder="seu.email@bookstore.internal"
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
                    placeholder="••••••••"
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
                className="w-full mt-2 font-semibold shadow-md shadow-primary/20"
            >
                <LogIn className="w-4 h-4" />
                {submitting ? 'Autenticando...' : 'Acessar Painel'}
            </Button>

            <div className="pt-2 text-center">
                <span className="text-xs text-muted-foreground">
                    Acesso restrito a operadores e administradores da livraria.
                </span>
            </div>
        </form>
    );
}
