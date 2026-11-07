import * as React from 'react';
import { cn } from './button';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('animate-pulse rounded-xl bg-muted/70', className)}
            {...props}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="glass-card rounded-2xl p-6 space-y-4">
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
            <div className="pt-4 flex items-center justify-between border-t border-border/40">
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
            </div>
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <div className="space-y-3">
            <div className="flex gap-4 p-4 border-b border-border/60">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1 rounded-md" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="flex gap-4 p-4 items-center">
                    {Array.from({ length: cols }).map((_, c) => (
                        <Skeleton key={c} className="h-5 flex-1 rounded-md" />
                    ))}
                </div>
            ))}
        </div>
    );
}
