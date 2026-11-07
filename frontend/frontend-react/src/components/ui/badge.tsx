import * as React from 'react';
import { cn } from './button';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    const variantStyles = {
        default: 'bg-muted/70 text-foreground border-border/80',
        secondary: 'bg-secondary/60 text-secondary-foreground border-border/50',
        destructive: 'bg-destructive/10 text-destructive border-destructive/20',
        outline: 'text-muted-foreground border-border/80 bg-background/50',
        success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    };

    return (
        <div
            className={cn(
                'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium font-mono transition-colors focus:outline-none',
                variantStyles[variant],
                className
            )}
            {...props}
        />
    );
}
