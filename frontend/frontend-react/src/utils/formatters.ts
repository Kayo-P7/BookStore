// formatadores reutilizaveis no padrao pt-BR evitando realocar instancias Intl a cada celula

const brlFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
});

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
});

export function formatCurrency(value: number | string | undefined | null): string {
    const numeric = typeof value === 'number' ? value : Number(value) || 0;
    return brlFormatter.format(numeric);
}

export function formatDate(dateString: string | undefined | null): string {
    if (!dateString) return '--';
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return dateTimeFormatter.format(d);
    } catch {
        return dateString;
    }
}

export function formatShortDate(value: string | number[] | undefined | null): string {
    if (!value) return '—';
    const d = Array.isArray(value)
        ? new Date(value[0], (value[1] || 1) - 1, value[2] || 1)
        : new Date(`${value}`.length === 10 ? `${value}T00:00:00` : value);
    return Number.isNaN(d.getTime()) ? '—' : shortDateFormatter.format(d);
}
