import * as React from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { cn } from './button';

export interface NoticeState {
    message: string;
    type: 'success' | 'error' | 'info';
}

export function useScreenNotice(autoCloseDuration = 4000) {
    const [notice, setNotice] = React.useState<NoticeState | null>(null);
    const [isExiting, setIsExiting] = React.useState(false);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    const closeNotice = React.useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            setNotice(null);
            setIsExiting(false);
        }, 300); // aguarda a animacao de fade-out
    }, []);

    const showNotice = React.useCallback(
        (message: string, type: 'success' | 'error' | 'info' = 'success') => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            setIsExiting(false);
            setNotice({ message, type });

            timerRef.current = setTimeout(() => {
                closeNotice();
            }, autoCloseDuration);
        },
        [autoCloseDuration, closeNotice]
    );

    React.useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return {
        notice,
        isExiting,
        showNotice,
        closeNotice
    };
}

interface ScreenNoticeProps {
    notice: NoticeState | null;
    isExiting: boolean;
    onClose: () => void;
    className?: string;
}

export function ScreenNotice({ notice, isExiting, onClose, className }: ScreenNoticeProps) {
    if (!notice) return null;

    const iconContainers = {
        success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
        error: 'bg-destructive/10 text-destructive border border-destructive/20',
        info: 'bg-muted text-muted-foreground border border-border/60'
    };

    const icons = {
        success: <Check className="w-3.5 h-3.5 stroke-[2.5]" />,
        error: <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />,
        info: <Info className="w-3.5 h-3.5" />
    };

    return (
        <div
            role="status"
            className={cn(
                'w-full rounded-xl p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-3 bg-card/95 text-foreground backdrop-blur-xl border border-border shadow-lg shadow-black/5 dark:shadow-black/25',
                isExiting ? 'notice-fade-out pointer-events-none' : 'notice-fade-in',
                className
            )}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', iconContainers[notice.type])}>
                    {icons[notice.type]}
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground tracking-tight truncate">
                    {notice.message}
                </span>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-lg transition-all duration-200 hover:rotate-90 active:scale-90 cursor-pointer shrink-0"
                title="Fechar aviso"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
