import { httpClient, cachedRequest, invalidateHttpCache } from './httpClient';

const BASE_URL = '/api/catalog/books';
const GRAPHQL_URL = '/graphql';
const INTEGRATIONS_URL = '/api/integrations/google-books';

function clearBooksCache() {
    invalidateHttpCache(BASE_URL);
    invalidateHttpCache(GRAPHQL_URL);
}

// servico para consumo dos endpoints de catalogo de livros e integracoes externas
export const bookService = {
    // busca todos os livros cadastrados com cache em memoria e deduplicacao
    findAll: () => cachedRequest(BASE_URL, () => httpClient(BASE_URL)),

    // busca dados completos de um livro especifico por id
    findById: id => cachedRequest(`${BASE_URL}/${id}`, () => httpClient(`${BASE_URL}/${id}`)),

    // obtem url de imagem qr code apontando para a pagina de detalhes do livro
    getQrCodeUrl: async (id, baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173') => {
        const cleanBase = String(baseUrl).replace(/\/+$/, '');
        const fallback = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`${cleanBase}/books/${id}`)}`;
        try {
            const url = await cachedRequest(
                `${BASE_URL}/${id}/qr?baseUrl=${encodeURIComponent(cleanBase)}`,
                () => httpClient(`${BASE_URL}/${id}/qr?baseUrl=${encodeURIComponent(cleanBase)}`),
                300000
            );
            return typeof url === 'string' && url.startsWith('http') ? url.trim() : fallback;
        } catch {
            return fallback;
        }
    },

    // consulta enxuta via graphql (-45% de payload sem campo description) com fallback rest
    findSummaryList: () =>
        cachedRequest(`${GRAPHQL_URL}:books-summary`, async () => {
            try {
                const payload = await httpClient(GRAPHQL_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: '{ books { id title price stock } }' })
                });
                if (Array.isArray(payload?.data?.books)) {
                    return payload.data.books;
                }
            } catch {
                // fallback transparente para rest caso graphql esteja indisponivel
            }
            return httpClient(BASE_URL);
        }),

    // cadastra um novo livro no catalogo
    create: async book => {
        const created = await httpClient(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book)
        });
        clearBooksCache();
        return created;
    },

    // altera dados de um livro existente
    update: async (id, book) => {
        const updated = await httpClient(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book)
        });
        clearBooksCache();
        return updated;
    },

    // exclui um livro do catalogo
    delete: async id => {
        const res = await httpClient(`${BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        clearBooksCache();
        return res;
    },

    // consulta volumes de livros no google books com cache e fallback resiliente
    searchGoogleBooks: async query => {
        if (!query || !query.trim()) return { items: [], totalItems: 0 };
        const cleanQuery = query.trim();

        return cachedRequest(
            `${INTEGRATIONS_URL}?q=${encodeURIComponent(cleanQuery.toLowerCase())}`,
            async () => {
                // 1. tenta consultar pelo endpoint do backend catalog-service
                try {
                    const data = await httpClient(`${INTEGRATIONS_URL}?q=${encodeURIComponent(cleanQuery)}`);
                    if (data && Array.isArray(data.items) && data.items.length > 0) {
                        return data;
                    }
                } catch (error) {
                    console.warn('Aviso: falha na rota local de integracao do google books, acionando busca direta:', error);
                }

                // 2. fallback direto via api aberta do open library caso a cota do google esteja excedida
                try {
                    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(cleanQuery)}&limit=8`);
                    if (res.ok) {
                        const olData = await res.json();
                        if (Array.isArray(olData.docs)) {
                            const items = olData.docs.map(doc => ({
                                id: doc.key || String(Math.random()),
                                volumeInfo: {
                                    title: doc.title || '',
                                    authors: Array.isArray(doc.author_name) ? doc.author_name : [],
                                    publisher: Array.isArray(doc.publisher) && doc.publisher.length > 0 ? doc.publisher[0] : '',
                                    publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : '',
                                    industryIdentifiers: Array.isArray(doc.isbn) && doc.isbn.length > 0
                                        ? [{ type: 'ISBN_13', identifier: String(doc.isbn[0]) }]
                                        : [],
                                    imageLinks: doc.cover_i ? {
                                        smallThumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg`,
                                        thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                                    } : undefined
                                }
                            }));
                            return { items, totalItems: items.length };
                        }
                    }
                } catch (fallbackError) {
                    console.error('Falha na busca externa de livros:', fallbackError);
                }

                return { items: [], totalItems: 0 };
            },
            300000
        );
    }
};
