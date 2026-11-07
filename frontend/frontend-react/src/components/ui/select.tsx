import * as React from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn } from './button';

export interface SelectOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

export interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    error?: boolean;
    disabled?: boolean;
    className?: string;
}

export function CustomSelect({
    value,
    onChange,
    options,
    placeholder = 'Selecione uma opção',
    searchable = true,
    searchPlaceholder = 'Digitar para buscar...',
    error = false,
    disabled = false,
    className
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) return options;
        const q = searchQuery.toLowerCase().trim();
        return options.filter(opt =>
            opt.label.toLowerCase().includes(q) ||
            (opt.description && opt.description.toLowerCase().includes(q))
        );
    }, [options, searchQuery]);

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
            if (searchable) {
                const timer = setTimeout(() => {
                    searchInputRef.current?.focus();
                }, 60);
                return () => {
                    clearTimeout(timer);
                    document.removeEventListener('pointerdown', handleClickOutside, true);
                    window.removeEventListener('keydown', handleKeyDown);
                };
            }
        } else {
            setSearchQuery('');
        }
        return () => {
            document.removeEventListener('pointerdown', handleClickOutside, true);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, searchable]);

    return (
        <div ref={containerRef} className={cn('relative w-full', className)}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(prev => !prev)}
                className={cn(
                    'flex h-10 w-full items-center justify-between rounded-lg border border-[#e5e5e5] bg-white px-3.5 py-2 text-sm text-[#171717]',
                    'transition-all duration-150 cursor-pointer shadow-2xs hover:border-[#d4d4d4]',
                    'focus-visible:outline-none focus-visible:border-[#171717] focus-visible:ring-1 focus-visible:ring-[#171717] active:scale-[0.99]',
                    'disabled:cursor-not-allowed disabled:bg-[#f5f5f5] disabled:opacity-60',
                    error && 'border-[#e11d48] hover:border-[#e11d48] focus-visible:ring-1 focus-visible:ring-[#e11d48] bg-rose-50/20'
                )}
            >
                <span className={cn('truncate', !selectedOption && 'text-[#a3a3a3]')}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={cn('h-4 w-4 text-[#737373] transition-transform duration-200 shrink-0 ml-2', isOpen && 'rotate-180')}
                />
            </button>

            {isOpen && (
                <div
                    className={cn(
                        'absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-xl',
                        'bg-white shadow-xl border border-[#e5e5e5] animate-dropdown-fade'
                    )}
                >
                    {/* campo de busca inteligente */}
                    {searchable && (
                        <div className="p-2 border-b border-[#f0f0f0] bg-[#fafafa]">
                            <div className="relative flex items-center">
                                <Search className="w-3.5 h-3.5 text-[#737373] absolute left-2.5 pointer-events-none" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className="w-full h-8 pl-8 pr-7 text-xs rounded-lg bg-white border border-[#e5e5e5] text-[#171717] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#171717] transition-colors"
                                    onClick={e => e.stopPropagation()}
                                    onKeyDown={e => {
                                        if (e.key === 'Escape') {
                                            setIsOpen(false);
                                        } else if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const firstMatch = filteredOptions.find(o => !o.disabled);
                                            if (firstMatch) {
                                                onChange(firstMatch.value);
                                                setIsOpen(false);
                                                setSearchQuery('');
                                            }
                                        }
                                    }}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation();
                                            setSearchQuery('');
                                            searchInputRef.current?.focus();
                                        }}
                                        className="absolute right-2 text-[#737373] hover:text-[#e11d48] p-0.5 rounded cursor-pointer"
                                        title="Limpar busca"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* lista de opcoes filtradas dinamicamente */}
                    <div className="max-h-56 overflow-y-auto p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="py-5 px-3 text-xs text-[#737373] text-center">
                                {searchQuery
                                    ? `Nenhum resultado encontrado para "${searchQuery}"`
                                    : 'Nenhuma opção disponível'}
                            </div>
                        ) : (
                            filteredOptions.map(option => {
                                const isSelected = option.value === value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        disabled={option.disabled}
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                            setSearchQuery('');
                                        }}
                                        className={cn(
                                            'w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer text-left',
                                            isSelected
                                                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                                                : 'text-[#171717] hover:bg-[#f5f5f5]',
                                            option.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
                                        )}
                                    >
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="truncate">{option.label}</div>
                                            {option.description && (
                                                <div className="text-[10px] text-[#737373] font-normal truncate mt-0.5">
                                                    {option.description}
                                                </div>
                                            )}
                                        </div>
                                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
