import { httpClient } from './httpClient';

const BASE_URL = '/api/catalog/books';
const INTEGRATIONS_URL = '/api/integrations/google-books';

// servico para consumo dos endpoints de catalogo de livros e integracoes externas
export const bookService = {
    // busca todos os livros cadastrados
    findAll: () => httpClient(BASE_URL),

    // cadastra um novo livro no catalogo
    create: book =>
        httpClient(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book)
        }),

    // consulta volumes de livros no google books com fallback resiliente
    searchGoogleBooks: async query => {
        if (!query || !query.trim()) return { items: [], totalItems: 0 };
        const cleanQuery = query.trim();

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
    }
};
