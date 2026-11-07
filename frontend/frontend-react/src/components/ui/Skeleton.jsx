import React from 'react';

// bloco pulsante basico para substituir spinners brutos
export function Skeleton({ className = '' }) {
    return <div className={`skeleton-block ${className}`} aria-hidden="true" />;
}

// estrutura de carregamento para cards de listas
export function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-3" />
            <Skeleton className="h-3 w-1/3 mt-auto" />
        </div>
    );
}

// estrutura de carregamento para tabelas de dados
export function SkeletonTable({ rows = 4, cols = 4 }) {
    return (
        <div className="skeleton-table-wrapper">
            <div className="skeleton-table-header">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-20" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="skeleton-table-row">
                    {Array.from({ length: cols }).map((_, c) => (
                        <Skeleton key={c} className="h-4 w-24" />
                    ))}
                </div>
            ))}
        </div>
    );
}
