import { httpClient } from './httpClient';

const BASE_URL = '/api/sales';

// servico para registro e historico de vendas
export const saleService = {
    // lista historico de vendas
    findAll: () => httpClient(BASE_URL),

    // registra uma nova transacao de venda
    create: sale =>
        httpClient(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sale)
        })
};
