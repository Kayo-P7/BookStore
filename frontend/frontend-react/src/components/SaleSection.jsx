import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CustomSelect } from './ui/CustomSelect';
import { InlineError } from './ui/InlineError';
import { SkeletonTable } from './ui/Skeleton';
import { Pagination } from './ui/Pagination';

// gerencia registro de novas vendas com customselect validacao inline e paginacao
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
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const selectedBook = books.find(book => String(book.id) === String(bookId));
    const total = selectedBook
        ? Number(selectedBook.price) * Number(quantity || 0)
        : 0;

    // valida os campos do formulario antes do envio
    function validate() {
        const newErrors = {};

        if (!customerId) {
            newErrors.customerId = 'Selecione um cliente para a venda.';
        }

        if (!bookId) {
            newErrors.bookId = 'Selecione um livro do catálogo.';
        }

        const qtyNum = Number(quantity);
        if (!quantity || isNaN(qtyNum) || qtyNum < 1) {
            newErrors.quantity = 'Informe uma quantidade válida maior que zero.';
        } else if (selectedBook && qtyNum > Number(selectedBook.stock)) {
            newErrors.quantity = `Estoque insuficiente (disponível: ${selectedBook.stock}).`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // envia os dados da nova venda apos validacao sem baloes nativos
    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;

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
            setErrors({});
            setCurrentPage(1);
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

    const customerOptions = customers.map(c => ({
        value: String(c.id),
        label: `${c.name} (${c.email})`
    }));

    const bookOptions = books.map(b => ({
        value: String(b.id),
        label: `${b.title} — Estoque: ${b.stock} (${formatCurrency(b.price)})`,
        disabled: Number(b.stock) < 1
    }));

    const paginatedSales = sales.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="sales-view">
            <section className="panel">
                <div className="section-heading">
                    <div>
                        <h2>Nova Venda</h2>
                        <p className="description">
                            Selecione o cliente, o livro e a quantidade desejada para efetivar o pedido.
                        </p>
                    </div>
                </div>

                <form noValidate onSubmit={handleSubmit} className="sale-form">
                    <div className="form-field">
                        <label>Cliente</label>
                        <CustomSelect
                            value={customerId}
                            onChange={val => {
                                setCustomerId(val);
                                if (errors.customerId) setErrors(errs => ({ ...errs, customerId: '' }));
                            }}
                            options={customerOptions}
                            placeholder="Selecione um cliente cadastrado"
                            error={Boolean(errors.customerId)}
                        />
                        <InlineError message={errors.customerId} />
                    </div>

                    <div className="form-field">
                        <label>Livro</label>
                        <CustomSelect
                            value={bookId}
                            onChange={val => {
                                setBookId(val);
                                if (errors.bookId) setErrors(errs => ({ ...errs, bookId: '' }));
                            }}
                            options={bookOptions}
                            placeholder="Selecione um livro com estoque"
                            error={Boolean(errors.bookId)}
                        />
                        <InlineError message={errors.bookId} />
                    </div>

                    <div className="form-field">
                        <label>Quantidade</label>
                        <input
                            type="number"
                            min="1"
                            max={selectedBook?.stock ?? undefined}
                            placeholder="1"
                            value={quantity}
                            className={errors.quantity ? 'input-error' : ''}
                            onChange={e => {
                                setQuantity(e.target.value);
                                if (errors.quantity) setErrors(errs => ({ ...errs, quantity: '' }));
                            }}
                        />
                        <InlineError message={errors.quantity} />
                    </div>

                    <div className="sale-total">
                        <div>
                            <span>Total Previsto:</span>
                            <strong>{formatCurrency(total)}</strong>
                        </div>
                        <button
                            type="submit"
                            disabled={savingSale}
                            className="primary primary-action-pill"
                        >
                            {savingSale ? 'Registrando...' : 'Confirmar Venda'}
                        </button>
                    </div>
                </form>
            </section>

            <section className="panel">
                <div className="section-heading">
                    <div>
                        <h2>Histórico de Vendas</h2>
                        <p className="description">
                            Total de {sales.length} transações registradas no sistema
                        </p>
                    </div>
                    <button className="secondary" onClick={onRefresh} title="Atualizar dados">
                        Atualizar
                    </button>
                </div>

                {loading ? (
                    <SkeletonTable rows={4} cols={5} />
                ) : sales.length === 0 ? (
                    <p className="empty">Nenhuma venda registrada ainda.</p>
                ) : (
                    <>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Data / Hora</th>
                                        <th>Cliente</th>
                                        <th>Livro</th>
                                        <th>Quantidade</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedSales.map(sale => (
                                        <tr key={sale.id}>
                                            <td><span className="badge-tech">#{sale.id}</span></td>
                                            <td>{formatDate(sale.createdAt)}</td>
                                            <td><strong>{customerName(sale.customerId)}</strong></td>
                                            <td>{bookTitle(sale.bookId)}</td>
                                            <td>{sale.quantity}x</td>
                                            <td><strong className="amount-val">{formatCurrency(sale.total)}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalItems={sales.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </section>
        </div>
    );
}
