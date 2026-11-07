import * as React from 'react';
import { cn } from './button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    'flex h-10 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm backdrop-blur-sm',
                    'text-foreground placeholder:text-muted-foreground/70 transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:border-primary',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    error && 'border-[#E11D48] focus:border-[#E11D48] focus-visible:border-[#E11D48] focus-visible:ring-1 focus-visible:ring-[#E11D48] bg-rose-50/20 dark:bg-rose-950/20',
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';
