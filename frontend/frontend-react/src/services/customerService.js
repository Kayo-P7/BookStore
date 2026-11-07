import { httpClient } from './httpClient';

const BASE_URL = '/api/customers';

// servico para gerenciamento de clientes e consulta de endereco
export const customerService = {
    // lista todos os clientes
    findAll: () => httpClient(BASE_URL),

    // consulta endereco via viacep
    lookupCep: cep => httpClient(`${BASE_URL}/cep/${cep}`),

    // cria um novo cliente
    create: customer =>
        httpClient(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customer)
        }),

    // atualiza dados de cliente existente
    update: (id, customer) =>
        httpClient(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customer)
        }),

    // exclui cliente por identificador
    delete: id =>
        httpClient(`${BASE_URL}/${id}`, {
            method: 'DELETE'
        })
};
