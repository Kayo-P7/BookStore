import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'cancel';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    hoverLift?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', hoverLift = false, ...props }, ref) => {
        const variantStyles = {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/25',
            destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm shadow-destructive/25',
            cancel: 'border border-red-200 dark:border-red-900/50 bg-white dark:bg-card text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300 hover:text-red-700 shadow-sm',
            outline: 'border border-border/80 bg-background/50 hover:bg-accent hover:text-accent-foreground backdrop-blur-sm',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground',
            link: 'text-primary underline-offset-4 hover:underline p-0 h-auto'
        };

        const sizeStyles = {
            default: 'h-10 px-4 py-2 text-sm',
            sm: 'h-8 rounded-lg px-3 text-xs',
            lg: 'h-11 rounded-xl px-6 text-base',
            icon: 'h-9 w-9 p-0 flex items-center justify-center'
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium cursor-pointer',
                    'transition-all duration-150 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:pointer-events-none disabled:opacity-50 select-none',
                    variantStyles[variant],
                    sizeStyles[size],
                    hoverLift && 'hover-lift',
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';
