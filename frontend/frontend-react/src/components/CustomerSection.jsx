import React, { useState } from 'react';
import { InlineError } from './ui/InlineError';
import { SkeletonCard } from './ui/Skeleton';
import { Pagination } from './ui/Pagination';

// gerencia tela de usuarios e clientes com validacao inline cancelamento vermelho e paginacao
export function CustomerSection({
    customerForm,
    editingCustomerId,
    savingCustomer,
    lookingUpCep,
    customers,
    loading,
    onUpdateField,
    onLookupCep,
    onSaveCustomer,
    onResetForm,
    onEditCustomer,
    onDeleteCustomer,
    onRefresh
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    // valida os campos de cliente antes de enviar
    function validate() {
        const newErrors = {};

        if (!customerForm.name.trim()) {
            newErrors.name = 'Informe o nome completo do cliente.';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!customerForm.email.trim()) {
            newErrors.email = 'Informe o endereço de e-mail.';
        } else if (!emailRegex.test(customerForm.email)) {
            newErrors.email = 'Informe um e-mail válido (ex: nome@dominio.com).';
        }

        const cleanCep = (customerForm.cep || '').replace(/\D/g, '');
        if (cleanCep && cleanCep.length !== 8) {
            newErrors.cep = 'O CEP deve conter exatamente 8 dígitos.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // trata o submit sem baloes nativos do navegador
    function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;
        onSaveCustomer(e);
        setErrors({});
    }

    const filteredCustomers = customers.filter(customer => {
        const query = searchTerm.toLowerCase();
        return (
            customer.name?.toLowerCase().includes(query) ||
            customer.email?.toLowerCase().includes(query) ||
            customer.city?.toLowerCase().includes(query) ||
            customer.phone?.includes(query)
        );
    });

    const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="customers-view">
            <section className="panel" id="customer-form">
                <div className="section-heading">
                    <div>
                        <h2>{editingCustomerId ? 'Editar Usuário / Cliente' : 'Novo Usuário / Cliente'}</h2>
                        <p className="description">
                            Preencha os dados e digite o CEP de 8 dígitos para preenchimento automático.
                        </p>
                    </div>
                    {editingCustomerId && (
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => {
                                onResetForm();
                                setErrors({});
                            }}
                            title="Cancelar alteração"
                        >
                            Cancelar Edição
                        </button>
                    )}
                </div>

                <form noValidate onSubmit={handleSubmit} className="customer-form">
                    <div className="form-field">
                        <label>Nome Completo</label>
                        <input
                            placeholder="Ex: Carlos Silva"
                            value={customerForm.name}
                            className={errors.name ? 'input-error' : ''}
                            onChange={e => {
                                onUpdateField('name', e.target.value);
                                if (errors.name) setErrors(errs => ({ ...errs, name: '' }));
                            }}
                        />
                        <InlineError message={errors.name} />
                    </div>

                    <div className="form-field">
                        <label>E-mail</label>
                        <input
                            type="email"
                            placeholder="Ex: carlos@email.com"
                            value={customerForm.email}
                            className={errors.email ? 'input-error' : ''}
                            onChange={e => {
                                onUpdateField('email', e.target.value);
                                if (errors.email) setErrors(errs => ({ ...errs, email: '' }));
                            }}
                        />
                        <InlineError message={errors.email} />
                    </div>

                    <div className="form-field">
                        <label>Telefone / Celular</label>
                        <input
                            type="tel"
                            placeholder="Ex: (11) 98765-4321"
                            value={customerForm.phone}
                            onChange={e => onUpdateField('phone', e.target.value)}
                        />
                    </div>

                    <div className="form-field">
                        <label>CEP (Busca ViaCEP)</label>
                        <div className="cep-input-group">
                            <input
                                placeholder="01001-000"
                                inputMode="numeric"
                                maxLength="9"
                                value={customerForm.cep}
                                className={errors.cep ? 'input-error' : ''}
                                onChange={e => {
                                    onUpdateField('cep', e.target.value);
                                    if (errors.cep) setErrors(errs => ({ ...errs, cep: '' }));
                                }}
                                onBlur={onLookupCep}
                            />
                            <button
                                type="button"
                                className="secondary"
                                onClick={onLookupCep}
                                disabled={lookingUpCep}
                            >
                                {lookingUpCep ? 'Buscando...' : 'Buscar CEP'}
                            </button>
                        </div>
                        <InlineError message={errors.cep} />
                    </div>

                    <div className="form-field">
                        <label>Logradouro / Rua</label>
                        <input
                            placeholder="Rua ou Avenida"
                            value={customerForm.street}
                            onChange={e => onUpdateField('street', e.target.value)}
                        />
                    </div>

                    <div className="form-field">
                        <label>Bairro</label>
                        <input
                            placeholder="Bairro"
                            value={customerForm.neighborhood}
                            onChange={e => onUpdateField('neighborhood', e.target.value)}
                        />
                    </div>

                    <div className="form-field">
                        <label>Cidade</label>
                        <input
                            placeholder="Cidade"
                            value={customerForm.city}
                            onChange={e => onUpdateField('city', e.target.value)}
                        />
                    </div>

                    <div className="form-field">
                        <label>Estado (UF)</label>
                        <input
                            placeholder="SP"
                            maxLength="2"
                            value={customerForm.state}
                            onChange={e => onUpdateField('state', e.target.value.toUpperCase())}
                        />
                    </div>

                    <div className="form-submit-row">
                        <button
                            type="submit"
                            disabled={savingCustomer || lookingUpCep}
                            className="primary primary-action-pill"
                        >
                            {savingCustomer
                                ? 'Salvando...'
                                : editingCustomerId
                                ? 'Salvar Alterações'
                                : 'Cadastrar Usuário'}
                        </button>
                    </div>
                </form>
            </section>

            <section className="panel">
                <div className="section-heading">
                    <div>
                        <h2>Usuários & Clientes Registrados</h2>
                        <p className="description">
                            Total de {customers.length} usuários cadastrados
                        </p>
                    </div>

                    <div className="heading-actions">
                        <input
                            type="text"
                            placeholder="Buscar por nome, email ou cidade..."
                            value={searchTerm}
                            onChange={e => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="search-input"
                        />
                        <button className="secondary" onClick={onRefresh} title="Atualizar lista">
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
                ) : filteredCustomers.length === 0 ? (
                    <p className="empty">
                        {searchTerm ? 'Nenhum usuário encontrado para esta busca.' : 'Nenhum usuário ou cliente cadastrado.'}
                    </p>
                ) : (
                    <>
                        <div className="books">
                            {paginatedCustomers.map(customer => (
                                <article key={customer.id}>
                                    <div className="customer-header">
                                        <span className="customer-avatar">
                                            {(customer.name || 'U').charAt(0).toUpperCase()}
                                        </span>
                                        <div>
                                            <b>{customer.name}</b>
                                            <p>{customer.email}</p>
                                        </div>
                                    </div>
                                    <small>
                                        {customer.phone || 'Telefone não informado'}
                                        {customer.city
                                            ? ` • ${customer.city}/${customer.state || ''}`
                                            : ''}
                                        {customer.street ? ` • ${customer.street}` : ''}
                                    </small>
                                    <div className="customer-actions">
                                        <button
                                            type="button"
                                            className="secondary"
                                            onClick={() => onEditCustomer(customer)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-destructive-outline"
                                            onClick={() => onDeleteCustomer(customer)}
                                            title="Excluir cliente"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredCustomers.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </section>
        </div>
    );
}
