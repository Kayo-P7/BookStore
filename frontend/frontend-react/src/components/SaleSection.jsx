import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../utils/formatters';

// gerencia registro de novas vendas e listagem do historico
export function SaleSection({
    customers,
    books,
    sales,
    loading,
    savingSale,
    onRegisterSale,
    onRefresh
}) {
    const [customerId, setCustomerId] = useState('');
    const [bookId, setBookId] = useState('');
    const [quantity, setQuantity] = useState('1');

    const selectedBook = books.find(book => String(book.id) === bookId);
    const total = selectedBook
        ? Number(selectedBook.price) * Number(quantity || 0)
        : 0;

    // envia os dados da nova venda
    async function handleSubmit(e) {
        e.preventDefault();
        const success = await onRegisterSale({
            customerId: Number(customerId),
            bookId: Number(bookId),
            quantity: Number(quantity),
            selectedBook
        });
        if (success) {
            setCustomerId('');
            setBookId('');
            setQuantity('1');
        }
    }

    // recupera o nome do cliente pelo id
    function customerName(id) {
        return customers.find(c => String(c.id) === String(id))?.name || `Cliente #${id}`;
    }

    // recupera o titulo do livro pelo id
    function bookTitle(id) {
        return books.find(b => String(b.id) === String(id))?.title || `Livro #${id}`;
    }

    return (
        <>
            <section className="panel">
                <h2>Nova venda</h2>
                <p className="description">
                    Selecione o cliente, o livro e a quantidade desejada.
                </p>

                <form onSubmit={handleSubmit}>
                    <label>
                        Cliente
                        <select
                            required
                            value={customerId}
                            onChange={e => setCustomerId(e.target.value)}
                        >
                            <option value="">Selecione um cliente</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Livro
                        <select
                            required
                            value={bookId}
                            onChange={e => setBookId(e.target.value)}
                        >
                            <option value="">Selecione um livro</option>
                            {books.map(book => (
                                <option
                                    key={book.id}
                                    value={book.id}
                                    disabled={Number(book.stock) < 1}
                                >
                                    {book.title} — Estoque: {book.stock}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Quantidade
                        <input
                            required
                            type="number"
                            min="1"
                            max={selectedBook?.stock ?? undefined}
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                        />
                    </label>

                    <div className="sale-total">
                        <small>Valor total</small>
                        <strong>{formatCurrency(total)}</strong>
                        {selectedBook && (
                            <span>{formatCurrency(selectedBook.price)} por unidade</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={
                            savingSale ||
                            loading ||
                            !customers.length ||
                            !books.length
                        }
                    >
                        {savingSale ? 'Registrando...' : 'Registrar venda'}
                    </button>
                </form>

                {!loading && !customers.length && (
                    <p className="description">
                        Cadastre clientes antes de registrar uma venda.
                    </p>
                )}
            </section>

            <section className="panel">
                <div className="section-heading">
                    <div>
                        <h2>Histórico de vendas</h2>
                        <p className="description">
                            Vendas registradas no sistema.
                        </p>
                    </div>
                    <button className="secondary" onClick={onRefresh}>
                        Atualizar
                    </button>
                </div>

                {loading ? (
                    <p>Carregando vendas...</p>
                ) : sales.length === 0 ? (
                    <p className="empty">Nenhuma venda registrada.</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Livro</th>
                                    <th>Quantidade</th>
                                    <th>Preço unitário</th>
                                    <th>Total</th>
                                    <th>Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...sales].reverse().map(sale => (
                                    <tr key={sale.id}>
                                        <td>#{sale.id}</td>
                                        <td>{customerName(sale.customerId)}</td>
                                        <td>{bookTitle(sale.bookId)}</td>
                                        <td>{sale.quantity}</td>
                                        <td>{formatCurrency(sale.unitPrice)}</td>
                                        <td><strong>{formatCurrency(sale.total)}</strong></td>
                                        <td>{formatDate(sale.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </>
    );
}
