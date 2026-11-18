import { httpClient, cachedRequest, invalidateHttpCache } from './httpClient';

const BASE_URL = '/api/users';

// servico para gerenciamento de operadores internos do sistema
export const userService = {
    // lista todos os operadores
    findAll: () => cachedRequest(BASE_URL, () => httpClient(BASE_URL)),

    // busca operador por identificador
    findById: id => httpClient(`${BASE_URL}/${id}`),

    // cadastra novo operador interno
    create: async user => {
        const created = await httpClient(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        invalidateHttpCache(BASE_URL);
        return created;
    },

    // atualiza dados e papel de operador existente
    update: async (id, user) => {
        const updated = await httpClient(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        invalidateHttpCache(BASE_URL);
        return updated;
    },

    // exclui operador por identificador
    delete: async id => {
        const res = await httpClient(`${BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        invalidateHttpCache(BASE_URL);
        return res;
    }
};
