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
            default: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs active:scale-[0.97]',
            destructive: 'bg-[#e11d48] text-white hover:bg-[#be123c] shadow-xs active:scale-[0.97]',
            cancel: 'border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 active:scale-[0.97] shadow-2xs font-medium',
            outline: 'border border-[#e5e5e5] bg-white text-[#171717] hover:bg-[#f5f5f5] active:scale-[0.97]',
            secondary: 'bg-[#f5f5f5] text-[#171717] hover:bg-[#e5e5e5] active:scale-[0.97]',
            ghost: 'hover:bg-[#f5f5f5] text-[#525252] hover:text-[#171717] active:scale-[0.97]',
            link: 'text-primary underline-offset-4 hover:underline p-0 h-auto'
        };

        const sizeStyles = {
            default: 'h-10 px-4 py-2 text-sm rounded-lg',
            sm: 'h-8 rounded-md px-3 text-xs',
            lg: 'h-11 rounded-lg px-6 text-sm font-medium',
            icon: 'h-9 w-9 rounded-lg p-0 flex items-center justify-center'
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer',
                    'transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
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
