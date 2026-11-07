import React from 'react';

// gerencia cadastro edicao e listagem de clientes
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
    return (
        <>
            <section className="panel" id="customer-form">
                <h2>{editingCustomerId ? 'Editar cliente' : 'Novo cliente'}</h2>
                <p className="description">
                    Informe o CEP para preencher o endereço automaticamente.
                </p>
                <form onSubmit={onSaveCustomer}>
                    <input
                        required
                        placeholder="Nome completo"
                        value={customerForm.name}
                        onChange={e => onUpdateField('name', e.target.value)}
                    />
                    <input
                        required
                        type="email"
                        placeholder="E-mail"
                        value={customerForm.email}
                        onChange={e => onUpdateField('email', e.target.value)}
                    />
                    <input
                        type="tel"
                        placeholder="Telefone"
                        value={customerForm.phone}
                        onChange={e => onUpdateField('phone', e.target.value)}
                    />
                    <input
                        placeholder="CEP"
                        inputMode="numeric"
                        maxLength="9"
                        value={customerForm.cep}
                        onChange={e => onUpdateField('cep', e.target.value)}
                        onBlur={onLookupCep}
                    />
                    <input
                        placeholder="Rua"
                        value={customerForm.street}
                        onChange={e => onUpdateField('street', e.target.value)}
                    />
                    <input
                        placeholder="Bairro"
                        value={customerForm.neighborhood}
                        onChange={e => onUpdateField('neighborhood', e.target.value)}
                    />
                    <input
                        placeholder="Cidade"
                        value={customerForm.city}
                        onChange={e => onUpdateField('city', e.target.value)}
                    />
                    <input
                        placeholder="Estado (UF)"
                        maxLength="2"
                        value={customerForm.state}
                        onChange={e => onUpdateField('state', e.target.value.toUpperCase())}
                    />
                    <button type="submit" disabled={savingCustomer || lookingUpCep}>
                        {savingCustomer
                            ? 'Salvando...'
                            : editingCustomerId
                            ? 'Salvar alterações'
                            : 'Cadastrar cliente'}
                    </button>
                    {editingCustomerId && (
                        <button
                            type="button"
                            className="secondary"
                            onClick={onResetForm}
                        >
                            Cancelar edição
                        </button>
                    )}
                    {lookingUpCep && <p className="description">Consultando CEP...</p>}
                </form>
            </section>

            <section className="panel">
                <div className="section-heading">
                    <div>
                        <h2>Clientes cadastrados</h2>
                        <p className="description">Gerencie os clientes da livraria.</p>
                    </div>
                    <button className="secondary" onClick={onRefresh}>
                        Atualizar
                    </button>
                </div>
                {loading ? (
                    <p>Carregando clientes...</p>
                ) : customers.length === 0 ? (
                    <p className="empty">Nenhum cliente cadastrado.</p>
                ) : (
                    <div className="books">
                        {customers.map(customer => (
                            <article key={customer.id}>
                                <b>{customer.name}</b>
                                <p>{customer.email}</p>
                                <small>
                                    {customer.phone || 'Telefone não informado'}
                                    {customer.city
                                        ? ` • ${customer.city}/${customer.state || ''}`
                                        : ''}
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
                                        className="secondary"
                                        onClick={() => onDeleteCustomer(customer)}
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
