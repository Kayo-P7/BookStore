import React from 'react';
import { formatCurrency, formatDate } from '../utils/formatters';

// tela principal com kpis no estilo dub feature pills e status dos servicos
export function DashboardSection({
    books,
    customers,
    sales,
    revenue,
    onNavigate
}) {
    // recupera o nome do cliente pelo id
    function customerName(id) {
        return customers.find(c => String(c.id) === String(id))?.name || `Cliente #${id}`;
    }

    // recupera o titulo do livro pelo id
    function bookTitle(id) {
        return books.find(b => String(b.id) === String(id))?.title || `Livro #${id}`;
    }

    const recentSales = sales.slice(-5).reverse();

    return (
        <div className="dashboard-view">
            <section className="welcome-banner">
                <div className="welcome-content">
                    <div className="feature-pills-row">
                        <span className="feature-pill pill-blue">
                            <span className="pill-dot"></span> Dub Design System
                        </span>
                        <span className="feature-pill pill-green">
                            <span className="pill-dot"></span> 3 Microsserviços Online
                        </span>
                        <span className="feature-pill pill-lavender">
                            <span className="pill-dot"></span> 5 APIs Integradas
                        </span>
                    </div>

                    <h2 className="display-headline">Gestão Moderna da Livraria</h2>
                    <p className="display-subheadline">
                        Plataforma unificada para catálogo, clientes, vendas distribuídas
                        e integrações de serviços externos com arquitetura em camadas.
                    </p>

                    <div className="quick-actions">
                        <button
                            type="button"
                            className="primary-action-pill"
                            onClick={() => onNavigate('sales')}
                        >
                            + Registrar Venda
                        </button>
                        <button
                            type="button"
                            className="feature-pill pill-tangerine action-pill"
                            onClick={() => onNavigate('books')}
                        >
                            Catálogo de Livros →
                        </button>
                        <button
                            type="button"
                            className="feature-pill pill-blue action-pill"
                            onClick={() => onNavigate('customers')}
                        >
                            Usuários & Clientes →
                        </button>
                        <button
                            type="button"
                            className="feature-pill pill-green action-pill"
                            onClick={() => onNavigate('services')}
                        >
                            Serviços Vue (CEP & Feriados) →
                        </button>
                    </div>
                </div>
            </section>

            <section className="stats">
                <article>
                    <small>Total de livros</small>
                    <strong className="stat-number">{books.length}</strong>
                    <span className="stat-hint">Itens gerenciados no catalog-service</span>
                </article>
                <article>
                    <small>Clientes cadastrados</small>
                    <strong className="stat-number">{customers.length}</strong>
                    <span className="stat-hint">Validados com consulta ViaCEP</span>
                </article>
                <article>
                    <small>Vendas concluídas</small>
                    <strong className="stat-number">{sales.length}</strong>
                    <span className="stat-hint">Transações registradas</span>
                </article>
                <article>
                    <small>Faturamento total</small>
                    <strong className="stat-number highlight">{formatCurrency(revenue)}</strong>
                    <span className="stat-hint">Volume financeiro consolidado</span>
                </article>
            </section>

            <div className="dashboard-grid">
                <section className="panel architecture-panel">
                    <div className="section-heading">
                        <div>
                            <h2>Arquitetura e Conectividade</h2>
                            <p className="description">
                                3 microsserviços, 2 frontends e 5 APIs integradas
                            </p>
                        </div>
                    </div>

                    <div className="services-grid">
                        <div className="service-card">
                            <div className="service-card-header">
                                <span className="service-name">Catalog Service</span>
                                <span className="status-badge online">Porta 8081</span>
                            </div>
                            <p className="service-desc">
                                Inventário de livros, estoque e integração com Google Books API.
                            </p>
                            <span className="service-tech">Python FastAPI • REST</span>
                        </div>

                        <div className="service-card">
                            <div className="service-card-header">
                                <span className="service-name">Customer Service</span>
                                <span className="status-badge online">Porta 8082</span>
                            </div>
                            <p className="service-desc">
                                Gestão de clientes e preenchimento de endereço via ViaCEP REST.
                            </p>
                            <span className="service-tech">Python FastAPI • REST + ViaCEP</span>
                        </div>

                        <div className="service-card">
                            <div className="service-card-header">
                                <span className="service-name">Sales Service</span>
                                <span className="status-badge online">Porta 8083</span>
                            </div>
                            <p className="service-desc">
                                Registro de vendas, cálculo de total e suporte a GraphQL & QR Code.
                            </p>
                            <span className="service-tech">Python FastAPI • GraphQL + REST</span>
                        </div>

                        <div className="service-card vue-card">
                            <div className="service-card-header">
                                <span className="service-name">Frontend Vue (Módulo Integrado)</span>
                                <span className="status-badge vue">Porta 5174</span>
                            </div>
                            <p className="service-desc">
                                Módulo de serviços para consulta de CEP e feriados nacionais Nager.Date.
                            </p>
                            <span className="service-tech">Vue 3 • Micro-frontend</span>
                        </div>
                    </div>
                </section>

                <section className="panel recent-sales-panel">
                    <div className="section-heading">
                        <div>
                            <h2>Últimas Vendas</h2>
                            <p className="description">Histórico recente de pedidos</p>
                        </div>
                        <button
                            type="button"
                            className="secondary"
                            onClick={() => onNavigate('sales')}
                        >
                            Ver todas
                        </button>
                    </div>

                    {recentSales.length === 0 ? (
                        <p className="empty">Nenhuma venda registrada ainda.</p>
                    ) : (
                        <div className="recent-sales-list">
                            {recentSales.map(sale => (
                                <div key={sale.id} className="recent-sale-item">
                                    <div className="sale-item-info">
                                        <strong>{bookTitle(sale.bookId)}</strong>
                                        <small>
                                            {customerName(sale.customerId)} • {formatDate(sale.createdAt)}
                                        </small>
                                    </div>
                                    <div className="sale-item-amount">
                                        <span className="qty-tag">{sale.quantity}x</span>
                                        <strong className="amount-val">{formatCurrency(sale.total)}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
