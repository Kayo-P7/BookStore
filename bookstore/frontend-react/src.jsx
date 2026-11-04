import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API = {
    books: '/api/catalog/books',
    customers: '/api/customers',
    sales: '/api/sales'
};

const money = value =>
    Number(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        const body = await response.text();
        throw new Error(body || ("Erro HTTP " + response.status));
    }

    if (response.status === 204) return null;

    const body = await response.text();
    return body ? JSON.parse(body) : null;
}

function App() {
    const [books, setBooks] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [sales, setSales] = useState([]);

    const [title, setTitle] = useState('');
    const [authors, setAuthors] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');

    const emptyCustomer = {
        name: '', email: '', phone: '', cep: '', street: '',
        neighborhood: '', city: '', state: ''
    };
    const [customerForm, setCustomerForm] = useState(emptyCustomer);
    const [editingCustomerId, setEditingCustomerId] = useState(null);
    const [savingCustomer, setSavingCustomer] = useState(false);
    const [lookingUpCep, setLookingUpCep] = useState(false);

    const [customerId, setCustomerId] = useState('');
    const [bookId, setBookId] = useState('');
    const [quantity, setQuantity] = useState('1');

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [savingSale, setSavingSale] = useState(false);

    async function loadData() {
        setLoading(true);
        setError('');

        try {
            const [booksData, customersData, salesData] =
                await Promise.all([
                    request(API.books),
                    request(API.customers),
                    request(API.sales)
                ]);

            setBooks(booksData);
            setCustomers(customersData);
            setSales(salesData);
        } catch (err) {
            setError('Não foi possível carregar os dados. Verifique os serviços.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function addBook(e) {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            await request(API.books, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    authors,
                    price: Number(price),
                    stock: Number(stock)
                })
            });

            setTitle('');
            setAuthors('');
            setPrice('');
            setStock('');
            setMessage('Livro cadastrado com sucesso.');

            await loadData();
        } catch (err) {
            setError('Erro ao cadastrar livro.');
            console.error(err);
        }
    }


    function updateCustomerField(field, value) {
        setCustomerForm(current => ({ ...current, [field]: value }));
    }

    function resetCustomerForm() {
        setCustomerForm(emptyCustomer);
        setEditingCustomerId(null);
    }

    async function lookupCep() {
        const cep = customerForm.cep.replace(/\D/g, '');
        if (cep.length !== 8) return;

        setLookingUpCep(true);
        try {
            const address = await request(API.customers + '/cep/' + cep);
            if (address.erro) {
                setError('CEP não encontrado.');
                return;
            }
            setCustomerForm(current => ({
                ...current,
                cep,
                street: address.logradouro || current.street,
                neighborhood: address.bairro || current.neighborhood,
                city: address.localidade || current.city,
                state: address.uf || current.state
            }));
        } catch (err) {
            setError('Não foi possível consultar o CEP.');
            console.error(err);
        } finally {
            setLookingUpCep(false);
        }
    }

    async function saveCustomer(e) {
        e.preventDefault();
        setMessage('');
        setError('');
        setSavingCustomer(true);

        const payload = {
            ...customerForm,
            cep: customerForm.cep.replace(/\D/g, '')
        };

        try {
            await request(
                editingCustomerId ? API.customers + '/' + editingCustomerId : API.customers,
                {
                    method: editingCustomerId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }
            );
            setMessage(editingCustomerId
                ? 'Cliente atualizado com sucesso.'
                : 'Cliente cadastrado com sucesso.');
            resetCustomerForm();
            await loadData();
        } catch (err) {
            setError('Não foi possível salvar o cliente. Confira os dados informados.');
            console.error(err);
        } finally {
            setSavingCustomer(false);
        }
    }

    function editCustomer(customer) {
        setCustomerForm({
            name: customer.name || '',
            email: customer.email || '',
            phone: customer.phone || '',
            cep: customer.cep || '',
            street: customer.street || '',
            neighborhood: customer.neighborhood || '',
            city: customer.city || '',
            state: customer.state || ''
        });
        setEditingCustomerId(customer.id);
        document.getElementById('customer-form')?.scrollIntoView({
            behavior: 'smooth', block: 'center'
        });
    }

    async function deleteCustomer(customer) {
        if (!window.confirm('Deseja realmente excluir ' + customer.name + '?')) return;
        setMessage('');
        setError('');
        try {
        await request(API.customers + '/' + customer.id, { method: 'DELETE' });
            if (String(customerId) === String(customer.id)) setCustomerId('');
            setMessage('Cliente excluído com sucesso.');
            await loadData();
        } catch (err) {
            setError('Não foi possível excluir o cliente.');
            console.error(err);
        }
    }

    const selectedBook = books.find(
        book => String(book.id) === bookId
    );

    const total = selectedBook
        ? Number(selectedBook.price) * Number(quantity || 0)
        : 0;

    async function registerSale(e) {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!customerId || !bookId) {
            setError('Selecione um cliente e um livro.');
            return;
        }

        if (!selectedBook || Number(quantity) < 1) {
            setError('Informe uma quantidade válida.');
            return;
        }

        if (Number(quantity) > Number(selectedBook.stock)) {
            setError('Quantidade maior que o estoque disponível.');
            return;
        }

        setSavingSale(true);

        try {
            await request(API.sales, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: Number(customerId),
                    bookId: Number(bookId),
                    quantity: Number(quantity)
                })
            });

            setCustomerId('');
            setBookId('');
            setQuantity('1');
            setMessage('Venda registrada com sucesso.');

            await loadData();
        } catch (err) {
            setError('Não foi possível registrar a venda. Verifique o estoque e os dados selecionados.');
            console.error(err);
        } finally {
            setSavingSale(false);
        }
    }

    function customerName(id) {
        return customers.find(c => String(c.id) === String(id))?.name
        || ('Cliente #' + id);
    }

    function bookTitle(id) {
        return books.find(b => String(b.id) === String(id))?.title
        || ('Livro #' + id);
    }

    const revenue = sales.reduce(
        (sum, sale) => sum + Number(sale.total || 0),
        0
    );

    return (
        <main>
            <header>
                <div>
                    <small>BOOKSTORE • PAINEL ADMINISTRATIVO</small>
                    <h1>Gerenciamento da livraria</h1>
                    <p>Controle de catálogo, clientes e vendas.</p>
                </div>
                <span>React</span>
            </header>

            {error && <div className="alert error">{error}</div>}
            {message && <div className="alert success">{message}</div>}

            <section className="stats">
                <article>
                    <small>Total de livros</small>
                    <strong>{books.length}</strong>
                </article>
                <article>
                    <small>Clientes cadastrados</small>
                    <strong>{customers.length}</strong>
                </article>
                <article>
                    <small>Vendas realizadas</small>
                    <strong>{sales.length}</strong>
                </article>
                <article>
                    <small>Faturamento registrado</small>
                    <strong>{money(revenue)}</strong>
                </article>
            </section>

            <section className="panel">
                <h2>Nova venda</h2>
                <p className="description">
                    Selecione o cliente, o livro e a quantidade desejada.
                </p>

                <form onSubmit={registerSale}>
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
                        <strong>{money(total)}</strong>
                        {selectedBook && (
                            <span>{money(selectedBook.price)} por unidade</span>
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
                    <button className="secondary" onClick={loadData}>
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
                                        <td>{money(sale.unitPrice)}</td>
                                        <td><strong>{money(sale.total)}</strong></td>
                                        <td>
                                            {sale.createdAt
                                                ? new Date(sale.createdAt).toLocaleDateString('pt-BR')
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>


            <section className="panel" id="customer-form">
                <h2>{editingCustomerId ? 'Editar cliente' : 'Novo cliente'}</h2>
                <p className="description">
                    Informe o CEP para preencher o endereço automaticamente.
                </p>
                <form onSubmit={saveCustomer}>
                    <input required placeholder="Nome completo" value={customerForm.name}
                        onChange={e => updateCustomerField('name', e.target.value)} />
                    <input required type="email" placeholder="E-mail" value={customerForm.email}
                        onChange={e => updateCustomerField('email', e.target.value)} />
                    <input type="tel" placeholder="Telefone" value={customerForm.phone}
                        onChange={e => updateCustomerField('phone', e.target.value)} />
                    <input placeholder="CEP" inputMode="numeric" maxLength="9"
                        value={customerForm.cep}
                        onChange={e => updateCustomerField('cep', e.target.value)}
                        onBlur={lookupCep} />
                    <input placeholder="Rua" value={customerForm.street}
                        onChange={e => updateCustomerField('street', e.target.value)} />
                    <input placeholder="Bairro" value={customerForm.neighborhood}
                        onChange={e => updateCustomerField('neighborhood', e.target.value)} />
                    <input placeholder="Cidade" value={customerForm.city}
                        onChange={e => updateCustomerField('city', e.target.value)} />
                    <input placeholder="Estado (UF)" maxLength="2" value={customerForm.state}
                        onChange={e => updateCustomerField('state', e.target.value.toUpperCase())} />
                    <button type="submit" disabled={savingCustomer || lookingUpCep}>
                        {savingCustomer ? 'Salvando...' :
                            editingCustomerId ? 'Salvar alterações' : 'Cadastrar cliente'}
                    </button>
                    {editingCustomerId && <button type="button" className="secondary"
                        onClick={resetCustomerForm}>Cancelar edição</button>}
                    {lookingUpCep && <p className="description">Consultando CEP...</p>}
                </form>
            </section>

            <section className="panel">
                <div className="section-heading">
                    <div>
                        <h2>Clientes cadastrados</h2>
                        <p className="description">Gerencie os clientes da livraria.</p>
                    </div>
                    <button className="secondary" onClick={loadData}>Atualizar</button>
                </div>
                {loading ? <p>Carregando clientes...</p> :
                    customers.length === 0 ? <p className="empty">Nenhum cliente cadastrado.</p> :
                    <div className="books">
                        {customers.map(customer => (
                            <article key={customer.id}>
                                <b>{customer.name}</b>
                                <p>{customer.email}</p>
                                <small>{customer.phone || 'Telefone não informado'}
            {customer.city ? ' • ' + customer.city + '/' + (customer.state || '') : ''}
                                </small>
                                <div className="customer-actions">
                                    <button type="button" className="secondary"
                                        onClick={() => editCustomer(customer)}>Editar</button>
                                    <button type="button" className="secondary"
                                        onClick={() => deleteCustomer(customer)}>Excluir</button>
                                </div>
                            </article>
                        ))}
                    </div>
                }
            </section>

            <section className="panel">
                <h2>Novo livro</h2>

                <form onSubmit={addBook}>
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
                    <button type="submit">Cadastrar livro</button>
                </form>
            </section>

            <section className="panel">
                <div className="section-heading">
                    <h2>Catálogo de livros</h2>
                    <button className="secondary" onClick={loadData}>
                        Atualizar
                    </button>
                </div>

                <div className="books">
                    {books.map(book => (
                        <article key={book.id}>
                            <b>{book.title}</b>
                            <p>{book.authors || 'Autor não informado'}</p>
                            <small>
                                {money(book.price)} • Estoque: {book.stock}
                            </small>
                        </article>
                    ))}
                </div>
            </section>

            <footer>
                BookStore • Sistema acadêmico de gerenciamento de livraria
            </footer>
        </main>
    );
}

createRoot(document.getElementById('root')).render(<App />);

