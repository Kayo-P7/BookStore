import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';
import { InlineError } from './ui/InlineError';
import { SkeletonCard } from './ui/Skeleton';
import { Pagination } from './ui/Pagination';

// gerencia catalogo de livros com validacao inline skeleton loading e paginacao
export function BookSection({ books, onAddBook, onRefresh, loading = false }) {
    const [title, setTitle] = useState('');
    const [authors, setAuthors] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    // valida os campos do formulario antes de submeter
    function validate() {
        const newErrors = {};

        if (!title.trim()) {
            newErrors.title = 'Informe o título do livro.';
        }

        const priceNum = Number(price);
        if (!price || isNaN(priceNum) || priceNum <= 0) {
            newErrors.price = 'Informe um preço válido maior que zero.';
        }

        const stockNum = Number(stock);
        if (stock === '' || isNaN(stockNum) || stockNum < 0) {
            newErrors.stock = 'Informe a quantidade em estoque (mínimo 0).';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // submete o cadastro de livro e limpa os campos
    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            await onAddBook({
                title: title.trim(),
                authors: authors.trim(),
                price: Number(price),
                stock: Number(stock)
            });
            setTitle('');
            setAuthors('');
            setPrice('');
            setStock('');
            setErrors({});
            setCurrentPage(1);
        } finally {
            setSubmitting(false);
        }
    }

    const filteredBooks = books.filter(b => {
        const query = searchTerm.toLowerCase();
        return (
            b.title?.toLowerCase().includes(query) ||
            b.authors?.toLowerCase().includes(query)
        );
    });

    const paginatedBooks = filteredBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="books-view">
            <section className="panel">
                <div className="section-heading">
                    <div>
                        <h2>Novo Livro</h2>
                        <p className="description">
                            Cadastre um novo título no inventário do catalog-service.
                        </p>
                    </div>
                </div>

                <form noValidate onSubmit={handleSubmit} className="book-form">
                    <div className="form-field">
                        <label>Título do Livro</label>
                        <input
                            placeholder="Ex: O Pequeno Príncipe"
                            value={title}
                            className={errors.title ? 'input-error' : ''}
                            onChange={e => {
                                setTitle(e.target.value);
                                if (errors.title) setErrors(errs => ({ ...errs, title: '' }));
                            }}
                        />
                        <InlineError message={errors.title} />
                    </div>

                    <div className="form-field">
                        <label>Autores (opcional)</label>
                        <input
                            placeholder="Ex: Antoine de Saint-Exupéry"
                            value={authors}
                            onChange={e => setAuthors(e.target.value)}
                        />
                    </div>

                    <div className="form-field">
                        <label>Preço Unitário (R$)</label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="Ex: 49.90"
                            value={price}
                            className={errors.price ? 'input-error' : ''}
                            onChange={e => {
                                setPrice(e.target.value);
                                if (errors.price) setErrors(errs => ({ ...errs, price: '' }));
                            }}
                        />
                        <InlineError message={errors.price} />
                    </div>

                    <div className="form-field">
                        <label>Quantidade em Estoque</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="Ex: 25"
                            value={stock}
                            className={errors.stock ? 'input-error' : ''}
                            onChange={e => {
                                setStock(e.target.value);
                                if (errors.stock) setErrors(errs => ({ ...errs, stock: '' }));
                            }}
                        />
                        <InlineError message={errors.stock} />
                    </div>

                    <div className="form-submit-row">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="primary primary-action-pill"
                        >
                            {submitting ? 'Cadastrando...' : 'Cadastrar Livro'}
                        </button>
                    </div>
                </form>
            </section>

            <section className="panel">
                <div className="section-heading">
                    <div>
                        <h2>Catálogo de Livros</h2>
                        <p className="description">
                            Total de {books.length} títulos no acervo
                        </p>
                    </div>

                    <div className="heading-actions">
                        <input
                            type="text"
                            placeholder="Buscar por título ou autor..."
                            value={searchTerm}
                            onChange={e => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="search-input"
                        />
                        <button className="secondary" onClick={onRefresh} title="Atualizar catálogo">
                            Atualizar
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="books">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : filteredBooks.length === 0 ? (
                    <p className="empty">
                        {searchTerm ? 'Nenhum livro encontrado para esta busca.' : 'Nenhum livro cadastrado no catálogo.'}
                    </p>
                ) : (
                    <>
                        <div className="books">
                            {paginatedBooks.map(book => (
                                <article key={book.id}>
                                    <b>{book.title}</b>
                                    <p>{book.authors || 'Autor não informado'}</p>
                                    <div className="book-card-footer">
                                        <span className="price">{formatCurrency(book.price)}</span>
                                        <span className={`stock ${Number(book.stock) < 5 ? 'low-stock' : ''}`}>
                                            {Number(book.stock) > 0 ? `Estoque: ${book.stock}` : 'Esgotado'}
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredBooks.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </section>
        </div>
    );
}
