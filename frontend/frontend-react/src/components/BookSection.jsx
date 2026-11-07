import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';

// gerencia formulario de novo livro e listagem do catalogo
export function BookSection({ books, onAddBook, onRefresh }) {
    const [title, setTitle] = useState('');
    const [authors, setAuthors] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // submete o cadastro de livro e limpa os campos
    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onAddBook({
                title,
                authors,
                price: Number(price),
                stock: Number(stock)
            });
            setTitle('');
            setAuthors('');
            setPrice('');
            setStock('');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <section className="panel">
                <h2>Novo livro</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        required
                        placeholder="Título"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                    <input
                        placeholder="Autores"
                        value={authors}
                        onChange={e => setAuthors(e.target.value)}
                    />
                    <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Preço"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                    />
                    <input
                        required
                        type="number"
                        min="0"
                        placeholder="Estoque"
                        value={stock}
                        onChange={e => setStock(e.target.value)}
                    />
                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Cadastrando...' : 'Cadastrar livro'}
                    </button>
                </form>
            </section>

            <section className="panel">
                <div className="section-heading">
                    <h2>Catálogo de livros</h2>
                    <button className="secondary" onClick={onRefresh}>
                        Atualizar
                    </button>
                </div>

                <div className="books">
                    {books.map(book => (
                        <article key={book.id}>
                            <b>{book.title}</b>
                            <p>{book.authors || 'Autor não informado'}</p>
                            <small>
                                {formatCurrency(book.price)} • Estoque: {book.stock}
                            </small>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}
