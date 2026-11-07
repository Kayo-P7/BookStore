import * as React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from './button';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'destructive' | 'success';
}

export function Alert({ className, variant = 'default', children, ...props }: AlertProps) {
    const variantStyles = {
        default: 'bg-muted/40 border-border text-foreground',
        destructive: 'bg-destructive/10 border-destructive/30 text-destructive',
        success: 'bg-card border-border shadow-sm text-foreground'
    };

    const icons = {
        default: <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />,
        destructive: <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />,
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
    };

    return (
        <div
            role="alert"
            className={cn(
                'relative w-full rounded-xl border p-4 backdrop-blur-md flex items-start gap-3 text-sm animate-in fade-in duration-200',
                variantStyles[variant],
                className
            )}
            {...props}
        >
            {icons[variant]}
            <div className="flex-1">{children}</div>
        </div>
    );
}

export function AlertTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h5 className={cn('mb-1 font-semibold leading-none tracking-tight', className)} {...props}>
            {children}
        </h5>
    );
}

export function AlertDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <div className={cn('text-sm opacity-90 leading-relaxed', className)} {...props}>
            {children}
        </div>
    );
}
