import * as React from 'react';
import { cn } from './button';

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    size?: 'sm' | 'default';
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    ({ className, checked = false, onCheckedChange, disabled, size = 'default', ...props }, ref) => {
        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            if (disabled) return;
            onCheckedChange?.(!checked);
            props.onClick?.(e);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (disabled) return;
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                onCheckedChange?.(!checked);
            }
            props.onKeyDown?.(e);
        };

        const isSm = size === 'sm';

        return (
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                ref={ref}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                className={cn(
                    'group relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50 select-none',
                    isSm ? 'h-5 w-9' : 'h-6 w-11',
                    checked ? 'bg-emerald-600' : 'bg-zinc-200',
                    className
                )}
                {...props}
            >
                <span
                    className={cn(
                        'pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out',
                        isSm ? 'h-3.5 w-3.5' : 'h-5 w-5',
                        isSm
                            ? checked
                                ? 'translate-x-4'
                                : 'translate-x-0.5'
                            : checked
                                ? 'translate-x-5.5'
                                : 'translate-x-0.5'
                    )}
                />
            </button>
        );
    }
);

Switch.displayName = 'Switch';
