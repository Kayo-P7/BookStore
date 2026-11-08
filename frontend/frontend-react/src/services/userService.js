import { httpClient } from './httpClient';

const BASE_URL = '/api/users';

// servico para gerenciamento de operadores internos do sistema
export const userService = {
    // lista todos os operadores
    findAll: () => httpClient(BASE_URL),

    // busca operador por identificador
    findById: id => httpClient(`${BASE_URL}/${id}`),

    // cadastra novo operador interno
    create: user =>
        httpClient(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        }),

    // atualiza dados e papel de operador existente
    update: (id, user) =>
        httpClient(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        }),

    // inativa ou exclui operador
    delete: id =>
        httpClient(`${BASE_URL}/${id}`, {
            method: 'DELETE'
        })
};
