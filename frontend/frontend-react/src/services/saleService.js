import { httpClient, cachedRequest, invalidateHttpCache } from './httpClient';

const BASE_URL = '/api/sales';

// servico para registro e historico de vendas
export const saleService = {
    // lista historico de vendas com cache curto
    findAll: () => cachedRequest(BASE_URL, () => httpClient(BASE_URL)),

    // obtem resumo consolidado (total, faturamento e ultimas 6 vendas) para a dashboard
    getSummary: () => cachedRequest(`${BASE_URL}/summary`, () => httpClient(`${BASE_URL}/summary`)),

    // registra uma nova transacao de venda e invalida caches afetados
    create: async sale => {
        const created = await httpClient(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sale)
        });
        invalidateHttpCache(BASE_URL);
        invalidateHttpCache('/api/catalog/books');
        invalidateHttpCache('/graphql');
        return created;
    }
};
