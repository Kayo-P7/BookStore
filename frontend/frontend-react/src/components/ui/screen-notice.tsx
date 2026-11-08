import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, AlertCircle, Info, X, Layers } from 'lucide-react';
import { cn } from './button';

export interface NoticeItem {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    isExiting?: boolean;
}

export type NoticeState = Omit<NoticeItem, 'id'>;

export function useScreenNotice(autoCloseDuration = 2600) {
    const [notices, setNotices] = React.useState<NoticeItem[]>([]);
    const timersRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map());

    const closeNotice = React.useCallback((id?: string) => {
        if (!id) {
            setNotices(prev => {
                if (prev.length === 0) return prev;
                const targetId = prev[prev.length - 1].id;
                return prev.map(n => (n.id === targetId ? { ...n, isExiting: true } : n));
            });
            setTimeout(() => {
                setNotices(prev => prev.slice(0, -1));
            }, 280);
            return;
        }

        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }

        setNotices(prev => prev.map(n => (n.id === id ? { ...n, isExiting: true } : n)));
        setTimeout(() => {
            setNotices(prev => prev.filter(n => n.id !== id));
        }, 280);
    }, []);

    const clearAll = React.useCallback(() => {
        timersRef.current.forEach(timer => clearTimeout(timer));
        timersRef.current.clear();
        setNotices(prev => prev.map(n => ({ ...n, isExiting: true })));
        setTimeout(() => {
            setNotices([]);
        }, 280);
    }, []);

    const showNotice = React.useCallback(
        (message: string, type: 'success' | 'error' | 'info' = 'success') => {
            const id = Math.random().toString(36).substring(2, 9);
            const newItem: NoticeItem = { id, message, type };

            setNotices(prev => {
                const filtered = prev.filter(n => !n.isExiting);
                return [newItem, ...filtered].slice(0, 5);
            });

            const timer = setTimeout(() => {
                closeNotice(id);
            }, autoCloseDuration);

            timersRef.current.set(id, timer);
        },
        [autoCloseDuration, closeNotice]
    );

    React.useEffect(() => {
        const timers = timersRef.current;
        return () => {
            timers.forEach(timer => clearTimeout(timer));
            timers.clear();
        };
    }, []);

    const notice = notices.length > 0 ? notices[0] : null;

    return {
        notice,
        notices,
        isExiting: notices.length > 0 ? Boolean(notices[0].isExiting) : false,
        showNotice,
        closeNotice,
        clearAll
    };
}

interface ScreenNoticeProps {
    notice?: NoticeState | null;
    notices?: NoticeItem[];
    isExiting?: boolean;
    onClose?: (id?: string) => void;
    onClearAll?: () => void;
    className?: string;
}

export function ScreenNotice({
    notice,
    notices,
    isExiting = false,
    onClose,
    onClearAll,
    className
}: ScreenNoticeProps) {
    const [isHovered, setIsHovered] = React.useState(false);

    // lista unificada de avisos para suportar tanto array de notices quanto objeto unico legado
    const list: NoticeItem[] = React.useMemo(() => {
        if (notices && notices.length > 0) return notices;
        if (notice) return [{ id: 'single', ...notice, isExiting }];
        return [];
    }, [notices, notice, isExiting]);

    if (list.length === 0 || typeof document === 'undefined') return null;

    const iconContainers = {
        success: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
        error: 'bg-rose-50 text-rose-600 border border-rose-200',
        info: 'bg-zinc-50 text-zinc-600 border border-zinc-200'
    };

    const icons = {
        success: <Check className="w-3.5 h-3.5 stroke-[2.5]" />,
        error: <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />,
        info: <Info className="w-3.5 h-3.5" />
    };

    const count = list.length;
    const isStacked = count > 1;

    return createPortal(
        <div
            className="fixed bottom-6 right-6 z-50 pointer-events-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative w-80 sm:w-96 h-14">
                {/* botao de limpar todos visivel ao expandir a pilha */}
                {isHovered && isStacked && onClearAll && (
                    <div
                        className="absolute -top-7 right-0 pointer-events-auto animate-in fade-in duration-150"
                        style={{ transform: `translateY(-${(count - 1) * 60}px)` }}
                    >
                        <button
                            type="button"
                            onClick={onClearAll}
                            className="text-[11px] font-semibold text-[#737373] hover:text-[#171717] bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#e5e5e5] shadow-xs hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                        >
                            Limpar todos ({count})
                        </button>
                    </div>
                )}

                {/* empilhamento em camadas estilo iphone */}
                {list.map((item, index) => {
                    const isTop = index === 0;

                    let translateY = 0;
                    let scale = 1;
                    let opacity = 1;
                    let zIndex = 30 - index;
                    let isVisible = true;

                    if (isHovered) {
                        translateY = -index * 60;
                        scale = 1;
                        opacity = item.isExiting ? 0 : 1;
                        zIndex = 30 - index;
                    } else {
                        if (index === 0) {
                            translateY = 0;
                            scale = 1;
                            opacity = item.isExiting ? 0 : 1;
                            zIndex = 30;
                        } else if (index === 1) {
                            translateY = -10;
                            scale = 0.95;
                            opacity = item.isExiting ? 0 : 0.88;
                            zIndex = 20;
                        } else if (index === 2) {
                            translateY = -18;
                            scale = 0.90;
                            opacity = item.isExiting ? 0 : 0.65;
                            zIndex = 10;
                        } else {
                            isVisible = false;
                        }
                    }

                    if (!isVisible) return null;

                    return (
                        <div
                            key={item.id}
                            style={{
                                transform: `translateY(${translateY}px) scale(${scale})`,
                                zIndex,
                                opacity: isHovered ? (item.isExiting ? 0 : 1) : opacity,
                                transformOrigin: 'bottom center',
                                transition: 'transform 360ms cubic-bezier(0.19, 1.28, 0.22, 1), opacity 240ms ease'
                            }}
                            className="absolute bottom-0 right-0 w-full pointer-events-auto"
                        >
                            <div
                                className={cn(
                                    'w-full rounded-xl px-4 py-3 flex items-center gap-3',
                                    'bg-white/95 backdrop-blur-md text-[#171717]',
                                    'border border-[#e5e5e5] shadow-xl shadow-black/8',
                                    item.isExiting ? 'notice-liquid-exit pointer-events-none' : 'notice-liquid-enter',
                                    className
                                )}
                            >
                                <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-2xs', iconContainers[item.type])}>
                                    {icons[item.type]}
                                </div>

                                <span className="text-xs sm:text-sm font-medium text-[#171717] tracking-tight truncate flex-1">
                                    {item.message}
                                </span>

                                {/* indicador de notificacoes empilhadas no card frontal */}
                                {isTop && isStacked && !isHovered && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200 shrink-0">
                                        <Layers className="w-2.5 h-2.5" />
                                        +{count - 1}
                                    </span>
                                )}

                                {/* botao fechar individual */}
                                <button
                                    type="button"
                                    onClick={e => {
                                        e.stopPropagation();
                                        onClose?.(item.id);
                                    }}
                                    className="text-[#737373] hover:text-[#171717] p-1 rounded-md hover:bg-[#f5f5f5] transition-colors cursor-pointer shrink-0 ml-1"
                                    title="Fechar aviso"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>,
        document.body
    );
}
