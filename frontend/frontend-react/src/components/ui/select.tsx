import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from './button';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    error?: boolean;
    disabled?: boolean;
    className?: string;
}

export function CustomSelect({
    value,
    onChange,
    options,
    placeholder = 'Selecione uma opção',
    error = false,
    disabled = false,
    className
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    React.useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('pointerdown', handleClickOutside, true);
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('pointerdown', handleClickOutside, true);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div ref={containerRef} className={cn('relative w-full', className)}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(prev => !prev)}
                className={cn(
                    'flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm backdrop-blur-sm',
                    'text-foreground transition-all duration-150 active:scale-[0.99] cursor-pointer',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    error && 'border-[#E11D48] focus-visible:ring-1 focus-visible:ring-[#E11D48] bg-rose-50/20 dark:bg-rose-950/20'
                )}
            >
                <span className={cn('truncate', !selectedOption && 'text-muted-foreground/70')}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', isOpen && 'rotate-180')}
                />
            </button>

            {isOpen && (
                <div
                    className={cn(
                        'absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-auto rounded-xl p-1',
                        'glass-card shadow-2xl border border-border/80 animate-dropdown-fade'
                    )}
                >
                    {options.length === 0 ? (
                        <div className="py-2.5 px-3 text-xs text-muted-foreground text-center">
                            Nenhuma opção disponível
                        </div>
                    ) : (
                        options.map(option => {
                            const isSelected = option.value === value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    disabled={option.disabled}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        'w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer text-left',
                                        isSelected
                                            ? 'bg-primary/15 text-primary font-medium'
                                            : 'text-foreground hover:bg-accent',
                                        option.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
                                    )}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-primary" />}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
