import { httpClient } from './httpClient';

const BASE_URL = '/api/catalog/books';

// servico para consumo dos endpoints de catalogo de livros
export const bookService = {
    // busca todos os livros cadastrados
    findAll: () => httpClient(BASE_URL),

    // cadastra um novo livro no catalogo
    create: book =>
        httpClient(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book)
        })
};
