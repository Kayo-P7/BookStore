// tipagens do sistema bookstore no padrao typescript

export interface Book {
    id: number;
    title: string;
    authors?: string;
    price: number;
    stock: number;
    createdAt?: string;
    updatedAt?: string;
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
