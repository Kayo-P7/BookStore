import { httpClient } from './httpClient';

const BASE_URL = '/api/loans';

export const loanService = {
    findAll: () => httpClient(BASE_URL),

    create: loan =>
        httpClient(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loan)
        }),

    returnLoan: id =>
        httpClient(`${BASE_URL}/${id}/return`, {
            method: 'PUT'
        }),

    findAllInventories: () => httpClient(`${BASE_URL}/inventory`),

    findInventoryByBookId: bookId => httpClient(`${BASE_URL}/inventory/${bookId}`),

    registerInventory: payload =>
        httpClient(`${BASE_URL}/inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
};
