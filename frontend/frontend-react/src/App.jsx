import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { StatsSection } from './components/StatsSection';
import { BookSection } from './components/BookSection';
import { CustomerSection } from './components/CustomerSection';
import { SaleSection } from './components/SaleSection';
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

// componente raiz da aplicacao react para gerenciamento da livraria
export function App() {
    const [books, setBooks] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [sales, setSales] = useState([]);

    const [customerForm, setCustomerForm] = useState(emptyCustomer);
    const [editingCustomerId, setEditingCustomerId] = useState(null);
    const [savingCustomer, setSavingCustomer] = useState(false);
    const [lookingUpCep, setLookingUpCep] = useState(false);
    const [savingSale, setSavingSale] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // carrega dados consolidados de livros clientes e vendas
    async function loadData() {
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
        loadData();
    }, []);

    // adiciona um novo livro via servico de catalogo
    async function handleAddBook(bookData) {
        setMessage('');
        setError('');

        try {
            await bookService.create(bookData);
            setMessage('Livro cadastrado com sucesso.');
            await loadData();
        } catch (err) {
            setError('Erro ao cadastrar livro.');
            console.error(err);
        }
    }

    // atualiza campo especifico do formulario de cliente
    function updateCustomerField(field, value) {
        setCustomerForm(current => ({ ...current, [field]: value }));
    }

    // reseta o formulario de cliente
    function resetCustomerForm() {
        setCustomerForm(emptyCustomer);
        setEditingCustomerId(null);
    }

    // consulta endereco via viacep
    async function handleLookupCep() {
        const cep = customerForm.cep.replace(/\D/g, '');
        if (cep.length !== 8) return;

        setLookingUpCep(true);
        try {
            const address = await customerService.lookupCep(cep);
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

    // salva ou atualiza cliente via servico de clientes
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
            await loadData();
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
        document.getElementById('customer-form')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }

    // exclui cliente existente
    async function handleDeleteCustomer(customer) {
        if (!window.confirm(`Deseja realmente excluir ${customer.name}?`)) return;
        setMessage('');
        setError('');
        try {
            await customerService.delete(customer.id);
            setMessage('Cliente excluído com sucesso.');
            await loadData();
        } catch (err) {
            setError('Não foi possível excluir o cliente.');
            console.error(err);
        }
    }

    // registra venda atraves do servico de vendas
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
            await loadData();
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
        <main>
            <Header />

            {error && <div className="alert error">{error}</div>}
            {message && <div className="alert success">{message}</div>}

            <StatsSection
                booksCount={books.length}
                customersCount={customers.length}
                salesCount={sales.length}
                revenue={revenue}
            />

            <SaleSection
                customers={customers}
                books={books}
                sales={sales}
                loading={loading}
                savingSale={savingSale}
                onRegisterSale={handleRegisterSale}
                onRefresh={loadData}
            />

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
                onDeleteCustomer={handleDeleteCustomer}
                onRefresh={loadData}
            />

            <BookSection
                books={books}
                onAddBook={handleAddBook}
                onRefresh={loadData}
            />

            <footer>BookStore • Sistema acadêmico de gerenciamento de livraria</footer>
        </main>
    );
}
