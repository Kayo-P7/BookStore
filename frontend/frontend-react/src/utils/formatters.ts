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

function parseFlexibleDate(value: string | number | number[] | undefined | null): Date | null {
    if (value === undefined || value === null || value === '') return null;
    if (Array.isArray(value)) {
        const d = new Date(value[0], (value[1] || 1) - 1, value[2] || 1);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    if (typeof value === 'number' || /^\d+(\.\d+)?$/.test(String(value).trim())) {
        const num = Number(value);
        // timestamps jackson em segundos (ex: 1794965059.123) sao menores que 1e11
        const ms = num < 1e11 ? num * 1000 : num;
        const d = new Date(ms);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    const str = String(value);
    const d = new Date(str.length === 10 ? `${str}T00:00:00` : str);
    return Number.isNaN(d.getTime()) ? null : d;
}

export function formatCurrency(value: number | string | undefined | null): string {
    const numeric = typeof value === 'number' ? value : Number(value) || 0;
    return brlFormatter.format(numeric);
}

export function formatDate(dateString: string | number | undefined | null): string {
    if (dateString === undefined || dateString === null || dateString === '') return '--';
    const d = parseFlexibleDate(dateString);
    return d ? dateTimeFormatter.format(d) : String(dateString);
}

export function formatShortDate(value: string | number | number[] | undefined | null): string {
    const d = parseFlexibleDate(value);
    return d ? shortDateFormatter.format(d) : '—';
}
