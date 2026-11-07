import { GoogleBookItem } from '../types';

export interface NormalizedGoogleBook {
    id: string;
    title: string;
    authors: string;
    isbn?: string;
    publisher?: string;
    description?: string;
    thumbnail?: string;
    publishedYear?: string;
}

// normaliza os dados brutos de um volume da api google books para o formato da aplicacao
export function normalizeGoogleBook(item: GoogleBookItem): NormalizedGoogleBook {
    const info = item.volumeInfo || {};

    // busca identificador isbn-13 prioritario ou isbn-10
    let isbn = '';
    if (Array.isArray(info.industryIdentifiers)) {
        const isbn13 = info.industryIdentifiers.find(id => id.type === 'ISBN_13');
        const isbn10 = info.industryIdentifiers.find(id => id.type === 'ISBN_10');
        isbn = isbn13?.identifier || isbn10?.identifier || '';
    }

    // trata autores unidos por virgula
    const authors = Array.isArray(info.authors) ? info.authors.join(', ') : '';

    // extrai o ano de publicacao
    const publishedYear = info.publishedDate ? info.publishedDate.slice(0, 4) : undefined;

    // limpa e normaliza a capa para https
    let thumbnail = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
    if (thumbnail && thumbnail.startsWith('http://')) {
        thumbnail = thumbnail.replace('http://', 'https://');
    }

    return {
        id: item.id,
        title: (info.title || '').trim(),
        authors: authors.trim(),
        isbn: isbn.trim(),
        publisher: (info.publisher || '').trim(),
        description: (info.description || '').trim(),
        thumbnail,
        publishedYear
    };
}
