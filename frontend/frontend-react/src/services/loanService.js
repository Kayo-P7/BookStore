import { httpClient, cachedRequest, invalidateHttpCache } from './httpClient';

const BASE_URL = '/api/loans';

export const loanService = {
    findAll: () => cachedRequest(BASE_URL, () => httpClient(BASE_URL)),

    create: async loan => {
        const created = await httpClient(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loan)
        });
        invalidateHttpCache(BASE_URL);
        return created;
    },

    returnLoan: async id => {
        const returned = await httpClient(`${BASE_URL}/${id}/return`, {
            method: 'PUT'
        });
        invalidateHttpCache(BASE_URL);
        return returned;
    },

    findAllInventories: () => cachedRequest(`${BASE_URL}/inventory`, () => httpClient(`${BASE_URL}/inventory`)),

    findInventoryByBookId: bookId => httpClient(`${BASE_URL}/inventory/${bookId}`),

    registerInventory: async payload => {
        const saved = await httpClient(`${BASE_URL}/inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        invalidateHttpCache(BASE_URL);
        return saved;
    }
};
