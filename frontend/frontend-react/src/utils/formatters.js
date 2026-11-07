// formata valores numericos para moeda brasileira
export const formatCurrency = value =>
    Number(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

// formata data iso para formato brasileiro
export const formatDate = dateString =>
    dateString ? new Date(dateString).toLocaleDateString('pt-BR') : '—';
