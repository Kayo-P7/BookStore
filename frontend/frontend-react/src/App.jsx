import React, { useEffect, useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardSection } from './components/DashboardSection';
import { BookSection } from './components/BookSection';
import { CustomerSection } from './components/CustomerSection';
import { SaleSection } from './components/SaleSection';
import { ServicesVueSection } from './components/ServicesVueSection';
import { SettingsSection } from './components/SettingsSection';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { bookService } from './services/bookService';
import { customerService } from './services/customerService';
import { saleService } from './services/saleService';

const emptyCustomer = {
    name: '',
    email: '',
    phone: '',
    cep: '',
    street: '',
    neighborhood: '',
    city: '',
    state: ''
};

const validTabs = ['dashboard', 'books', 'customers', 'sales', 'services', 'settings'];

// componente raiz com portal unificado navegacao por menus e modulo vue integrado
export function App() {
    const initialHash = window.location.hash ? window.location.hash.replace('#', '') : 'dashboard';
    const [activeTab, setActiveTab] = useState(validTabs.includes(initialHash) ? initialHash : 'dashboard');
    const [theme, setTheme] = useState(() => localStorage.getItem('bookstore-theme') || 'dark');

    const [books, setBooks] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [sales, setSales] = useState([]);

    const [customerForm, setCustomerForm] = useState(emptyCustomer);
    const [editingCustomerId, setEditingCustomerId] = useState(null);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [deletingCustomer, setDeletingCustomer] = useState(false);
    const [savingCustomer, setSavingCustomer] = useState(false);
    const [lookingUpCep, setLookingUpCep] = useState(false);
    const [savingSale, setSavingSale] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const lastSearchedCep = useRef('');

    // aplica o tema no elemento html e persiste no localstorage
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('bookstore-theme', theme);
    }, [theme]);

    // alterna entre tema escuro e claro
    function toggleTheme() {
        setTheme(current => (current === 'dark' ? 'light' : 'dark'));
    }

    // sincroniza a aba ativa com o historico de hash da url
    function handleSelectTab(tab) {
        if (!validTabs.includes(tab)) return;
        setActiveTab(tab);
        window.location.hash = tab;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // escuta alteracoes de hash no navegador
    useEffect(() => {
        function handleHashChange() {
            const hash = window.location.hash.replace('#', '');
            if (validTabs.includes(hash)) {
                setActiveTab(hash);
            }
        }
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // busca apenas a lista de livros do catalogo
    async function loadBooks() {
        try {
            const data = await bookService.findAll();
            setBooks(data || []);
        } catch (err) {
            console.error(err);
        }
    }

    // busca apenas a lista de clientes cadastrados
    async function loadCustomers() {
        try {
            const data = await customerService.findAll();
            setCustomers(data || []);
        } catch (err) {
            console.error(err);
        }
    }

    // busca apenas o historico de vendas realizadas
    async function loadSales() {
        try {
            const data = await saleService.findAll();
            setSales(data || []);
        } catch (err) {
            console.error(err);
        }
    }

    // carrega dados iniciais de todos os servicos no primeiro carregamento
    async function loadInitialData() {
        setLoading(true);
        setError('');

        try {
            const [booksData, customersData, salesData] = await Promise.all([
                bookService.findAll(),
                customerService.findAll(),
                saleService.findAll()
            ]);

            setBooks(booksData || []);
            setCustomers(customersData || []);
            setSales(salesData || []);
        } catch (err) {
            setError('Não foi possível carregar os dados. Verifique os serviços.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadInitialData();
    }, []);

    // adiciona livro e atualiza somente a lista de livros
    async function handleAddBook(bookData) {
        setMessage('');
        setError('');

        try {
            await bookService.create(bookData);
            setMessage('Livro cadastrado com sucesso.');
            await loadBooks();
        } catch (err) {
            setError('Erro ao cadastrar livro.');
            console.error(err);
        }
    }

    // atualiza campo especifico do formulario de cliente
    function updateCustomerField(field, value) {
        setCustomerForm(current => ({ ...current, [field]: value }));
    }

    // reseta o formulario de cliente e limpa o cache de cep consultado
    function resetCustomerForm() {
        setCustomerForm(emptyCustomer);
        setEditingCustomerId(null);
        lastSearchedCep.current = '';
    }

    // consulta endereco via viacep evitando chamadas repetidas para o mesmo cep
    async function handleLookupCep() {
        const cep = customerForm.cep.replace(/\D/g, '');
        if (cep.length !== 8 || lastSearchedCep.current === cep) return;

        setLookingUpCep(true);
        try {
            const address = await customerService.lookupCep(cep);
            if (address.erro) {
                setError('CEP não encontrado.');
                return;
            }
            lastSearchedCep.current = cep;
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

    // salva ou edita cliente e atualiza somente a lista de clientes
    async function handleSaveCustomer(e) {
        e.preventDefault();
        setMessage('');
        setError('');
        setSavingCustomer(true);

        const payload = {
            ...customerForm,
            cep: customerForm.cep.replace(/\D/g, '')
        };

        try {
            if (editingCustomerId) {
                await customerService.update(editingCustomerId, payload);
                setMessage('Cliente atualizado com sucesso.');
            } else {
                await customerService.create(payload);
                setMessage('Cliente cadastrado com sucesso.');
            }
            resetCustomerForm();
            await loadCustomers();
        } catch (err) {
            setError('Não foi possível salvar o cliente. Confira os dados informados.');
            console.error(err);
        } finally {
            setSavingCustomer(false);
        }
    }

    // prepara o formulario para edicao de cliente
    function handleEditCustomer(customer) {
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
        lastSearchedCep.current = (customer.cep || '').replace(/\D/g, '');
        handleSelectTab('customers');
        document.getElementById('customer-form')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }

    // abre modal customizado para confirmacao de exclusao sem usar confirm nativo
    function handleRequestDeleteCustomer(customer) {
        setCustomerToDelete(customer);
    }

    // confirma exclusao de cliente e atualiza a lista
    async function handleConfirmDelete() {
        if (!customerToDelete) return;
        setDeletingCustomer(true);
        setMessage('');
        setError('');
        try {
            await customerService.delete(customerToDelete.id);
            setMessage('Cliente excluído com sucesso.');
            setCustomerToDelete(null);
            await loadCustomers();
        } catch (err) {
            setError('Não foi possível excluir o cliente.');
            console.error(err);
        } finally {
            setDeletingCustomer(false);
        }
    }

    // registra venda e atualiza apenas vendas e estoque do catalogo
    async function handleRegisterSale({ customerId, bookId, quantity, selectedBook }) {
        setMessage('');
        setError('');

        if (!customerId || !bookId) {
            setError('Selecione um cliente e um livro.');
            return false;
        }

        if (!selectedBook || Number(quantity) < 1) {
            setError('Informe uma quantidade válida.');
            return false;
        }

        if (Number(quantity) > Number(selectedBook.stock)) {
            setError('Quantidade maior que o estoque disponível.');
            return false;
        }

        setSavingSale(true);

        try {
            await saleService.create({
                customerId,
                bookId,
                quantity
            });

            setMessage('Venda registrada com sucesso.');
            await Promise.all([loadSales(), loadBooks()]);
            return true;
        } catch (err) {
            setError('Não foi possível registrar a venda. Verifique o estoque e os dados selecionados.');
            console.error(err);
            return false;
        } finally {
            setSavingSale(false);
        }
    }

    const revenue = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);

    return (
        <div className="app-layout">
            <Sidebar activeTab={activeTab} onSelectTab={handleSelectTab} />

            <div className="app-main-wrapper">
                <Navbar
                    activeTab={activeTab}
                    onRefresh={loadInitialData}
                    loading={loading}
                    theme={theme}
                    onToggleTheme={toggleTheme}
                />

                <main className="app-content-body">
                    {error && (
                        <div className="alert error">
                            <span className="alert-icon">⚠️</span>
                            <span>{error}</span>
                            <button
                                type="button"
                                className="alert-close"
                                onClick={() => setError('')}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {message && (
                        <div className="alert success">
                            <span className="alert-icon">✓</span>
                            <span>{message}</span>
                            <button
                                type="button"
                                className="alert-close"
                                onClick={() => setMessage('')}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {activeTab === 'dashboard' && (
                        <DashboardSection
                            books={books}
                            customers={customers}
                            sales={sales}
                            revenue={revenue}
                            onNavigate={handleSelectTab}
                        />
                    )}

                    {activeTab === 'books' && (
                        <BookSection
                            books={books}
                            onAddBook={handleAddBook}
                            onRefresh={loadBooks}
                            loading={loading}
                        />
                    )}

                    {activeTab === 'customers' && (
                        <CustomerSection
                            customerForm={customerForm}
                            editingCustomerId={editingCustomerId}
                            savingCustomer={savingCustomer}
                            lookingUpCep={lookingUpCep}
                            customers={customers}
                            loading={loading}
                            onUpdateField={updateCustomerField}
                            onLookupCep={handleLookupCep}
                            onSaveCustomer={handleSaveCustomer}
                            onResetForm={resetCustomerForm}
                            onEditCustomer={handleEditCustomer}
                            onDeleteCustomer={handleRequestDeleteCustomer}
                            onRefresh={loadCustomers}
                        />
                    )}

                    {activeTab === 'sales' && (
                        <SaleSection
                            customers={customers}
                            books={books}
                            sales={sales}
                            loading={loading}
                            savingSale={savingSale}
                            onRegisterSale={handleRegisterSale}
                            onRefresh={() => Promise.all([loadSales(), loadBooks()])}
                        />
                    )}

                    {activeTab === 'services' && (
                        <ServicesVueSection theme={theme} />
                    )}

                    {activeTab === 'settings' && (
                        <SettingsSection theme={theme} onSetTheme={setTheme} />
                    )}

                    <ConfirmDialog
                        isOpen={Boolean(customerToDelete)}
                        title="Excluir Usuário / Cliente"
                        description={`Deseja realmente excluir "${customerToDelete?.name}"? Esta ação removerá o cadastro permanentemente e é irreversível.`}
                        confirmText="Confirmar Exclusão"
                        cancelText="Cancelar"
                        onConfirm={handleConfirmDelete}
                        onCancel={() => setCustomerToDelete(null)}
                        loading={deletingCustomer}
                    />

                    <footer className="app-footer">
                        BookStore OS • Sistema Distribuído de Livraria & Biblioteca • React 18 & Vue 3
                    </footer>
                </main>
            </div>
        </div>
    );
}
