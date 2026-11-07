// formatadores de moeda e data no padrao pt-BR

export function formatCurrency(value: number | string | undefined | null): string {
    const numeric = typeof value === 'number' ? value : Number(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(numeric);
}

export function formatDate(dateString: string | undefined | null): string {
    if (!dateString) return '--';
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(d);
    } catch {
        return dateString;
    }
}
