import * as React from 'react';
import { Search, Plus, SlidersHorizontal, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Pagination } from '../components/ui/pagination';
import { cn } from '../components/ui/button';

export interface ColumnDefinition {
    key: string;
    label: string;
    visible?: boolean;
}

export interface RecordsTableLayoutProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    columns: ColumnDefinition[];
    visibleColumns: string[];
    onToggleColumn: (key: string) => void;
    totalRecords: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    isEmpty?: boolean;
    emptyMessage?: string;
    extraFilters?: React.ReactNode;
    children: React.ReactNode;
}

export function RecordsTableLayout({
    title,
    description,
    actionLabel,
    onAction,
    searchTerm,
    onSearchChange,
    searchPlaceholder = 'Filtrar registros...',
    columns = [],
    visibleColumns = [],
    onToggleColumn,
    totalRecords,
    currentPage,
    pageSize,
    onPageChange,
    isLoading = false,
    isEmpty = false,
    emptyMessage = 'Nenhum registro encontrado.',
    extraFilters,
    children
}: RecordsTableLayoutProps) {
    const [columnDropdownOpen, setColumnDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setColumnDropdownOpen(false);
            }
        }
        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') setColumnDropdownOpen(false);
        }
        if (columnDropdownOpen) {
            document.addEventListener('pointerdown', handleClickOutside, true);
            window.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('pointerdown', handleClickOutside, true);
            window.removeEventListener('keydown', handleEscape);
        };
    }, [columnDropdownOpen]);

    return (
        <Card className="w-full">
            {/* barra superior com titulo e acao rapida de criacao */}
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#f0f0f0]">
                <div>
                    <CardTitle className="text-xl font-bold">{title}</CardTitle>
                    <CardDescription className="mt-1">{description}</CardDescription>
                </div>

                {actionLabel && onAction && (
                    <Button
                        variant="default"
                        size="default"
                        hoverLift
                        onClick={onAction}
                        className="shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        {actionLabel}
                    </Button>
                )}
            </CardHeader>

            {/* controles de busca e alternancia de colunas */}
            <div className="p-6 pb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="pl-10"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {extraFilters}
                    {/* dropdown com checkboxes para alternar visibilidade de colunas */}
                    <div ref={dropdownRef} className="relative">
                        <Button
                            variant="outline"
                            size="default"
                            onClick={() => setColumnDropdownOpen(prev => !prev)}
                            className="gap-2 text-xs"
                            title="Alternar colunas visíveis"
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Colunas ({visibleColumns.length}/{columns.length})</span>
                        </Button>

                        {columnDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-[#e5e5e5] shadow-xl p-2 z-50 animate-dropdown-fade">
                                <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-[#737373] uppercase font-mono border-b border-[#f0f0f0]">
                                    Exibir Colunas
                                </div>
                                <div className="py-1 max-h-56 overflow-y-auto space-y-0.5">
                                    {columns.map(col => {
                                        const isVisible = visibleColumns.includes(col.key);
                                        return (
                                            <button
                                                key={col.key}
                                                type="button"
                                                onClick={() => onToggleColumn(col.key)}
                                                className="w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-xl hover:bg-accent/80 transition-colors text-left cursor-pointer"
                                            >
                                                <span className="text-foreground">{col.label}</span>
                                                <div
                                                    className={cn(
                                                        'w-4 h-4 rounded-md border flex items-center justify-center transition-colors',
                                                        isVisible
                                                            ? 'bg-primary border-primary text-white'
                                                            : 'border-border bg-background'
                                                    )}
                                                >
                                                    {isVisible && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* tabela ou empty state */}
            <CardContent className="pt-2">
                {isEmpty && !isLoading ? (
                    <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border/70 bg-muted/20">
                        <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tente refinar sua busca ou adicione um novo registro no botão acima.
                        </p>
                    </div>
                ) : (
                    children
                )}

                {/* paginacao dinamica */}
                {!isEmpty && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalRecords}
                        pageSize={pageSize}
                        onPageChange={onPageChange}
                    />
                )}
            </CardContent>
        </Card>
    );
}
