import * as React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './button';

export interface PaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export function Pagination({
    currentPage,
    totalItems,
    pageSize,
    onPageChange
}: PaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(totalItems, currentPage * pageSize);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 px-1 text-sm text-muted-foreground">
            <div>
                Exibindo <span className="font-semibold text-foreground">{startItem}</span> a{' '}
                <span className="font-semibold text-foreground">{endItem}</span> de{' '}
                <span className="font-semibold text-foreground">{totalItems}</span> registros
            </div>

            <div className="flex items-center gap-1.5">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    title="Primeira página"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Página anterior"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="px-3 py-1 text-xs font-medium rounded-lg border border-[#e5e5e5] bg-white text-[#171717]">
                    Página {currentPage} de {totalPages}
                </span>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="Próxima página"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    title="Última página"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
