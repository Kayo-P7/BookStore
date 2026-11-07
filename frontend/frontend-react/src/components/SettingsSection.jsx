import React, { useState } from 'react';

// tela de configuracoes com diagnostico de conexao alternancia de tema e arquitetura
export function SettingsSection({ theme, onSetTheme }) {
    const [pings, setPings] = useState({
        catalog: { status: 'idle', time: null },
        customer: { status: 'idle', time: null },
        sales: { status: 'idle', time: null },
        vue: { status: 'idle', time: null }
    });
    const [testing, setTesting] = useState(false);

    // testa a conectividade e latencia de cada servico em tempo real
    async function testConnections() {
        setTesting(true);
        const results = {};

        async function pingEndpoint(key, url) {
            const start = performance.now();
            try {
                const res = await fetch(url, { method: 'GET', cache: 'no-cache' });
                const elapsed = Math.round(performance.now() - start);
                results[key] = {
                    status: res.ok || res.status < 500 ? 'online' : 'error',
                    time: `${elapsed}ms`
                };
            } catch (err) {
                results[key] = { status: 'offline', time: 'falha' };
            }
        }

        await Promise.all([
            pingEndpoint('catalog', '/api/catalog/books'),
            pingEndpoint('customer', '/api/customers'),
            pingEndpoint('sales', '/api/sales'),
            pingEndpoint('vue', 'http://localhost:5174')
        ]);

        setPings(results);
        setTesting(false);
    }

    return (
        <div className="settings-view">
            <section className="panel">
                <div className="section-heading">
                    <div>
                        <h2>Aparência e Tema da Interface</h2>
                        <p className="description">
                            Escolha entre o tema escuro moderno ou o tema claro profissional.
                        </p>
                    </div>
                </div>

                <div className="theme-selector-grid">
                    <button
                        type="button"
                        className={`theme-card-btn ${theme === 'dark' ? 'active' : ''}`}
                        onClick={() => onSetTheme('dark')}
                    >
                        <div className="theme-preview dark-preview">
                            <div className="preview-sidebar"></div>
                            <div className="preview-content">
                                <div className="preview-box"></div>
                                <div className="preview-box"></div>
                            </div>
                        </div>
                        <div className="theme-card-info">
                            <strong>Tema Escuro (Forest Obsidian)</strong>
                            <small>Obsidian profundo com detalhes neon mint e bordas sutis</small>
                        </div>
                        {theme === 'dark' && <span className="theme-active-tag">Ativo</span>}
                    </button>

                    <button
                        type="button"
                        className={`theme-card-btn ${theme === 'light' ? 'active' : ''}`}
                        onClick={() => onSetTheme('light')}
                    >
                        <div className="theme-preview light-preview">
                            <div className="preview-sidebar"></div>
                            <div className="preview-content">
                                <div className="preview-box"></div>
                                <div className="preview-box"></div>
                            </div>
                        </div>
                        <div className="theme-card-info">
                            <strong>Tema Claro (Verde & Branco)</strong>
                            <small>Canvas branco com verde esmeralda e bordas hairline</small>
                        </div>
                        {theme === 'light' && <span className="theme-active-tag">Ativo</span>}
                    </button>
                </div>
            </section>

            <section className="panel">
                <div className="section-heading">
                    <div>
                        <h2>Status e Diagnóstico de Conectividade</h2>
                        <p className="description">
                            Monitore a integridade e tempo de resposta dos microsserviços.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={testConnections}
                        disabled={testing}
                        className="primary"
                    >
                        {testing ? 'Testando Conexões...' : 'Testar Conexões Agora'}
                    </button>
                </div>

                <div className="connectivity-grid">
                    <div className="ping-card">
                        <div className="ping-card-header">
                            <strong>Catalog Service</strong>
                            <span className={`status-pill ${pings.catalog.status}`}>
                                {pings.catalog.status}
                            </span>
                        </div>
                        <p className="description">Porta 8081 • Endpoint: /api/catalog/books</p>
                        <small className="ping-time">Latência: {pings.catalog.time || '--'}</small>
                    </div>

                    <div className="ping-card">
                        <div className="ping-card-header">
                            <strong>Customer Service</strong>
                            <span className={`status-pill ${pings.customer.status}`}>
                                {pings.customer.status}
                            </span>
                        </div>
                        <p className="description">Porta 8082 • Endpoint: /api/customers</p>
                        <small className="ping-time">Latência: {pings.customer.time || '--'}</small>
                    </div>

                    <div className="ping-card">
                        <div className="ping-card-header">
                            <strong>Sales Service</strong>
                            <span className={`status-pill ${pings.sales.status}`}>
                                {pings.sales.status}
                            </span>
                        </div>
                        <p className="description">Porta 8083 • Endpoint: /api/sales</p>
                        <small className="ping-time">Latência: {pings.sales.time || '--'}</small>
                    </div>

                    <div className="ping-card">
                        <div className="ping-card-header">
                            <strong>Frontend Vue (Módulo)</strong>
                            <span className={`status-pill ${pings.vue.status}`}>
                                {pings.vue.status}
                            </span>
                        </div>
                        <p className="description">Porta 5174 • Host Vite + Vue 3</p>
                        <small className="ping-time">Latência: {pings.vue.time || '--'}</small>
                    </div>
                </div>
            </section>

            <section className="panel">
                <div className="section-heading">
                    <div>
                        <h2>Mapeamento das 5 APIs do Sistema</h2>
                        <p className="description">
                            Atende ao requisito acadêmico de 5 APIs com pelo menos 1 não-REST.
                        </p>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>API / Serviço</th>
                                <th>Tipo</th>
                                <th>Origem</th>
                                <th>Protocolo / Formato</th>
                                <th>Finalidade</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Catálogo de Livros</strong></td>
                                <td><span className="badge-tech">REST</span></td>
                                <td>catalog-service (:8081)</td>
                                <td>JSON / HTTP</td>
                                <td>Cadastro e inventário de títulos</td>
                            </tr>
                            <tr>
                                <td><strong>Clientes & Endereços</strong></td>
                                <td><span className="badge-tech">REST</span></td>
                                <td>customer-service (:8082)</td>
                                <td>JSON / HTTP</td>
                                <td>Cadastro de clientes</td>
                            </tr>
                            <tr>
                                <td><strong>Vendas & Histórico</strong></td>
                                <td><span className="badge-tech highlight">GraphQL (Não-REST)</span></td>
                                <td>sales-service (:8083)</td>
                                <td>Queries / Schema GraphQL</td>
                                <td>Consulta estruturada e relatórios</td>
                            </tr>
                            <tr>
                                <td><strong>ViaCEP</strong></td>
                                <td><span className="badge-tech">REST Pública</span></td>
                                <td>viacep.com.br</td>
                                <td>HTTPS / JSON</td>
                                <td>Autopreenchimento de endereço por CEP</td>
                            </tr>
                            <tr>
                                <td><strong>Nager.Date Feriados</strong></td>
                                <td><span className="badge-tech">REST Pública</span></td>
                                <td>date.nager.at</td>
                                <td>HTTPS / JSON</td>
                                <td>Calendário de feriados bancários no módulo Vue</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="panel">
                <div className="section-heading">
                    <div>
                        <h2>Informações do Ambiente</h2>
                        <p className="description">Configuração lida do arquivo .env</p>
                    </div>
                </div>

                <div className="env-details-grid">
                    <div className="env-item">
                        <small>Banco de Dados</small>
                        <strong>PostgreSQL 15 (porta 5433)</strong>
                    </div>
                    <div className="env-item">
                        <small>Porta Portal Principal (React)</small>
                        <strong>5173</strong>
                    </div>
                    <div className="env-item">
                        <small>Porta Módulo Secundário (Vue)</small>
                        <strong>5174</strong>
                    </div>
                    <div className="env-item">
                        <small>Porta Gateway (Nginx opcional)</small>
                        <strong>8080</strong>
                    </div>
                    <div className="env-item">
                        <small>Ambiente de Execução</small>
                        <strong>Localhost / Linux</strong>
                    </div>
                    <div className="env-item">
                        <small>Design System</small>
                        <strong>Dub Design System (Refero Styles #b0d80806)</strong>
                    </div>
                </div>
            </section>
        </div>
    );
}
