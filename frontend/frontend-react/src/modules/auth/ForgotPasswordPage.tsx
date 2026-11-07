import * as React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'Informe seu e-mail cadastrado.')
        .email('Informe um e-mail válido para envio das instruções.')
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
    const [sent, setSent] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: 'onChange'
    });

    async function onSubmit(_data: ForgotPasswordFormData) {
        setSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 400));
        setSubmitting(false);
        setSent(true);
    }

    if (sent) {
        return (
            <div className="text-center space-y-4 py-2 animate-in fade-in duration-200">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-foreground">Instruções Enviadas</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Enviamos um link com instruções para redefinição de senha para o e-mail informado.
                    </p>
                </div>
                <Link to="/auth/login" className="inline-block pt-2">
                    <Button variant="outline" size="default" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para o Login
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    <span>E-mail Cadastrado</span>
                </label>
                <Input
                    type="email"
                    placeholder="usuario@bookstore.internal"
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

            <Button
                type="submit"
                variant="default"
                size="lg"
                hoverLift
                disabled={submitting}
                className="w-full mt-2 font-semibold shadow-2xs hover:shadow-xs"
            >
                <KeyRound className="w-4 h-4" />
                {submitting ? 'Enviando...' : 'Recuperar Senha'}
            </Button>

            <div className="pt-2 text-center">
                <Link
                    to="/auth/login"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Retornar ao Login
                </Link>
            </div>
        </form>
    );
}
