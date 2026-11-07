import * as React from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { cn } from './button';

export interface NoticeState {
    message: string;
    type: 'success' | 'error' | 'info';
}

export function useScreenNotice(autoCloseDuration = 3000) {
    const [notice, setNotice] = React.useState<NoticeState | null>(null);
    const [isExiting, setIsExiting] = React.useState(false);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    const closeNotice = React.useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            setNotice(null);
            setIsExiting(false);
        }, 340); // aguarda a animacao de desaparecimento liquid
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
        success: 'bg-emerald-50/75 text-[#059669] border border-emerald-200/70',
        error: 'bg-rose-50/75 text-[#e11d48] border border-rose-200/70',
        info: 'bg-[#fafafa]/75 text-[#737373] border border-[#e5e5e5]/70'
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
                'w-full rounded-xl p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-3',
                'bg-white/75 backdrop-blur-md text-[#171717] border border-[#e5e5e5]/80 shadow-md shadow-black/5',
                isExiting ? 'notice-fade-out pointer-events-none' : 'notice-fade-in',
                className
            )}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs', iconContainers[notice.type])}>
                    {icons[notice.type]}
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#171717] tracking-tight truncate">
                    {notice.message}
                </span>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="text-red-500 hover:text-red-700 bg-red-50/70 hover:bg-red-100 border border-red-200/60 p-1.5 rounded-lg transition-all duration-200 hover:rotate-90 active:scale-90 cursor-pointer shrink-0"
                title="Fechar aviso"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
