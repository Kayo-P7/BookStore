import React from 'react';
import { formatCurrency } from '../utils/formatters';

// exibe resumo com totais de livros clientes vendas e faturamento
export function StatsSection({ booksCount, customersCount, salesCount, revenue }) {
    return (
        <section className="stats">
            <article>
                <small>Total de livros</small>
                <strong>{booksCount}</strong>
            </article>
            <article>
                <small>Clientes cadastrados</small>
                <strong>{customersCount}</strong>
            </article>
            <article>
                <small>Vendas realizadas</small>
                <strong>{salesCount}</strong>
            </article>
            <article>
                <small>Faturamento registrado</small>
                <strong>{formatCurrency(revenue)}</strong>
            </article>
        </section>
    );
}
