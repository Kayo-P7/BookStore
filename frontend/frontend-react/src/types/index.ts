// tipagens do sistema bookstore no padrao typescript

export interface Book {
    id: number;
    title: string;
    authors?: string;
    isbn?: string;
    publisher?: string;
    description?: string;
    price: number;
    stock: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface GoogleBookVolumeInfo {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{
        type: string;
        identifier: string;
    }>;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
        smallThumbnail?: string;
        thumbnail?: string;
    };
    language?: string;
}

export interface GoogleBookItem {
    id: string;
    volumeInfo: GoogleBookVolumeInfo;
}

export interface GoogleBooksSearchResponse {
    items?: GoogleBookItem[];
    totalItems?: number;
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    cep?: string;
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Sale {
    id: number;
    customerId: number;
    bookId: number;
    quantity: number;
    unitPrice?: number;
    total: number;
    createdAt: string;
}

export interface UserProfile {
    name: string;
    email: string;
    role: string;
    initials: string;
}
