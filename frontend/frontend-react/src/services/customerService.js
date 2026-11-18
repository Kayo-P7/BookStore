import { httpClient, cachedRequest, invalidateHttpCache } from './httpClient';

const BASE_URL = '/api/customers';

// servico para gerenciamento de clientes e consulta de endereco
export const customerService = {
    // lista todos os clientes com cache curto e deduplicacao
    findAll: () => cachedRequest(BASE_URL, () => httpClient(BASE_URL)),

    // consulta endereco via viacep com cache de 10 minutos
    lookupCep: cep => {
        const cleanCep = String(cep || '').replace(/\D/g, '');
        return cachedRequest(`${BASE_URL}/cep/${cleanCep}`, () => httpClient(`${BASE_URL}/cep/${cleanCep}`), 600000);
    },

    // cria um novo cliente
    create: async customer => {
        const created = await httpClient(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customer)
        });
        invalidateHttpCache(BASE_URL);
        return created;
    },

    // atualiza dados de cliente existente
    update: async (id, customer) => {
        const updated = await httpClient(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customer)
        });
        invalidateHttpCache(BASE_URL);
        return updated;
    },

    // exclui cliente por identificador
    delete: async id => {
        const res = await httpClient(`${BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        invalidateHttpCache(BASE_URL);
        return res;
    }
};
