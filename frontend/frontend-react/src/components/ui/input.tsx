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
                    'flex h-10 w-full rounded-lg border border-[#e5e5e5] bg-white px-3.5 py-2 text-sm text-[#171717]',
                    'placeholder:text-[#a3a3a3] transition-all duration-150',
                    'hover:border-[#d4d4d4] focus-visible:outline-none focus-visible:border-[#171717] focus-visible:ring-1 focus-visible:ring-[#171717]',
                    'disabled:cursor-not-allowed disabled:bg-[#f5f5f5] disabled:opacity-60 shadow-2xs',
                    error && 'border-[#e11d48] hover:border-[#e11d48] focus-visible:border-[#e11d48] focus-visible:ring-1 focus-visible:ring-[#e11d48] bg-rose-50/20',
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';
