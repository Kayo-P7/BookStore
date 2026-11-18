import * as React from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './button';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
];

const fullDateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
});

function toIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function parseIsoDate(iso?: string): Date | null {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
    const [y, m, d] = iso.split('-').map(Number);
    const parsed = new Date(y, m - 1, d);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export interface DatePickerProps {
    value?: string;
    onChange: (isoDate: string) => void;
    minDate?: string;
    placeholder?: string;
    error?: boolean;
    disabled?: boolean;
    className?: string;
}

export function DatePicker({
    value,
    onChange,
    minDate,
    placeholder = 'Selecione uma data',
    error = false,
    disabled = false,
    className
}: DatePickerProps) {
    const selectedDate = React.useMemo(() => parseIsoDate(value), [value]);
    const todayIso = React.useMemo(() => toIsoDate(new Date()), []);

    const [isOpen, setIsOpen] = React.useState(false);
    const [viewDate, setViewDate] = React.useState<Date>(() => selectedDate || new Date());
    const [coords, setCoords] = React.useState<{ top: number; left: number }>({
        top: 12,
        left: 12
    });

    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const popoverRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (selectedDate) {
            setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
        }
    }, [selectedDate]);

    const updatePosition = React.useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const pad = 12;
        const gap = 6;
        const popWidth = popoverRef.current?.offsetWidth || 288;
        const popHeight = popoverRef.current?.offsetHeight || 348;

        const left = Math.min(
            Math.max(pad, rect.left),
            Math.max(pad, window.innerWidth - popWidth - pad)
        );

        const spaceBelow = window.innerHeight - rect.bottom - pad;
        const spaceAbove = rect.top - pad;

        let top: number;
        if (spaceBelow >= popHeight + gap) {
            top = rect.bottom + gap;
        } else if (spaceAbove >= popHeight + gap) {
            top = rect.top - popHeight - gap;
        } else {
            // quando a tela for baixa, posiciona totalmente visivel dentro da viewport
            top = Math.max(pad, Math.min(rect.bottom + gap, window.innerHeight - popHeight - pad));
        }

        setCoords({ top, left });
    }, []);

    React.useLayoutEffect(() => {
        if (!isOpen) return;
        updatePosition();
    }, [isOpen, viewDate, updatePosition]);

    React.useEffect(() => {
        if (!isOpen) return;

        function handlePointerDown(e: MouseEvent) {
            const target = e.target as Node;
            if (
                triggerRef.current &&
                !triggerRef.current.contains(target) &&
                popoverRef.current &&
                !popoverRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        }

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                e.stopPropagation();
                setIsOpen(false);
            }
        }

        document.addEventListener('pointerdown', handlePointerDown, true);
        window.addEventListener('keydown', handleKeyDown, true);
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown, true);
            window.removeEventListener('keydown', handleKeyDown, true);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isOpen, updatePosition]);

    const calendarDays = React.useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayOfWeek = firstDayOfMonth.getDay();
        const gridStart = new Date(year, month, 1 - startDayOfWeek);

        const cells: { date: Date; iso: string; inCurrentMonth: boolean; isDisabled: boolean }[] = [];
        for (let i = 0; i < 42; i++) {
            const cellDate = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
            const iso = toIsoDate(cellDate);
            cells.push({
                date: cellDate,
                iso,
                inCurrentMonth: cellDate.getMonth() === month,
                isDisabled: Boolean(minDate && iso < minDate)
            });
        }
        return cells;
    }, [viewDate, minDate]);

    function handleSelectIso(iso: string) {
        if (minDate && iso < minDate) return;
        onChange(iso);
        setIsOpen(false);
    }

    function applyOffsetDays(days: number) {
        const base = new Date();
        base.setDate(base.getDate() + days);
        const iso = toIsoDate(base);
        if (minDate && iso < minDate) return;
        onChange(iso);
        setIsOpen(false);
    }

    return (
        <div className={cn('relative w-full', className)}>
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(prev => !prev)}
                className={cn(
                    'flex h-10 w-full items-center justify-start gap-2.5 rounded-lg border border-[#e5e5e5] bg-white px-3.5 py-2 text-sm text-left',
                    'transition-all duration-150 cursor-pointer shadow-2xs hover:border-[#d4d4d4]',
                    'focus-visible:outline-none focus-visible:border-[#171717] focus-visible:ring-1 focus-visible:ring-[#171717]',
                    'disabled:cursor-not-allowed disabled:bg-[#f5f5f5] disabled:opacity-60',
                    error && 'border-[#e11d48] hover:border-[#e11d48] focus-visible:ring-[#e11d48] bg-rose-50/20'
                )}
            >
                <CalendarIcon className="h-4 w-4 shrink-0 text-[#737373]" />
                <span className={cn('truncate', selectedDate ? 'text-[#171717] font-normal' : 'text-[#a3a3a3]')}>
                    {selectedDate ? fullDateFormatter.format(selectedDate) : placeholder}
                </span>
            </button>

            {isOpen &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        ref={popoverRef}
                        onClick={e => e.stopPropagation()}
                        style={{
                            position: 'fixed',
                            top: coords.top,
                            left: coords.left
                        }}
                        className="z-[10001]"
                    >
                        <div className="w-72 max-h-[calc(100vh-24px)] overflow-y-auto rounded-xl border border-[#e5e5e5] bg-white p-3 shadow-2xl shadow-black/12 animate-dropdown-fade select-none">
                            {/* cabecalho mes/ano estilo shadcn ui calendar */}
                            <div className="flex items-center justify-between pb-2.5">
                                <button
                                    type="button"
                                    onClick={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f5f5f5] hover:text-[#171717] transition-colors cursor-pointer"
                                    aria-label="Mês anterior"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <span className="text-xs font-semibold text-[#171717]">
                                    {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f5f5f5] hover:text-[#171717] transition-colors cursor-pointer"
                                    aria-label="Próximo mês"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>

                            {/* dias da semana */}
                            <div className="grid grid-cols-7 mb-1">
                                {WEEKDAYS.map(day => (
                                    <div
                                        key={day}
                                        className="flex h-8 w-full items-center justify-center text-[11px] font-medium text-[#737373]"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* grade de dias */}
                            <div className="grid grid-cols-7 gap-y-0.5">
                                {calendarDays.map(cell => {
                                    const isSelected = cell.iso === value;
                                    const isToday = cell.iso === todayIso;
                                    return (
                                        <button
                                            key={cell.iso}
                                            type="button"
                                            disabled={cell.isDisabled}
                                            onClick={() => handleSelectIso(cell.iso)}
                                            className={cn(
                                                'mx-auto flex h-8 w-8 items-center justify-center rounded-md text-xs transition-colors cursor-pointer',
                                                !cell.inCurrentMonth && !isSelected && 'text-[#a3a3a3]',
                                                cell.inCurrentMonth && !isSelected && 'text-[#171717] hover:bg-emerald-50 hover:text-emerald-700',
                                                isToday && !isSelected && 'bg-[#f5f5f5] font-semibold text-[#171717] border border-[#e5e5e5]',
                                                isSelected && 'bg-[#059669] text-white font-semibold hover:bg-[#047857] shadow-2xs',
                                                cell.isDisabled && 'opacity-35 pointer-events-none cursor-not-allowed hover:bg-transparent'
                                            )}
                                        >
                                            {cell.date.getDate()}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* atalhos rapidos uteis para devolucao */}
                            <div className="mt-2.5 pt-2.5 border-t border-[#f0f0f0] flex items-center justify-between gap-1.5">
                                {[
                                    { label: '+7 dias', days: 7 },
                                    { label: '+14 dias', days: 14 },
                                    { label: '+30 dias', days: 30 }
                                ].map(preset => (
                                    <button
                                        key={preset.days}
                                        type="button"
                                        onClick={() => applyOffsetDays(preset.days)}
                                        className="flex-1 rounded-md border border-[#e5e5e5] bg-[#fafafa] px-2 py-1 text-[11px] font-medium text-[#525252] hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}
