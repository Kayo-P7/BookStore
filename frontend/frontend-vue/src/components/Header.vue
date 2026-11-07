<template>
    <header>
        <div>
            <small>BOOKSTORE • SERVIÇOS AO CLIENTE</small>
            <h1>Informações e consultas</h1>
            <p>Consulta de endereço por CEP e calendário de feriados nacionais.</p>
        </div>
        <div class="header-badges">
            <span class="badge-tag">Vue.js SPA</span>
            <a
                href="http://localhost:5173"
                target="_blank"
                rel="noreferrer"
                className="nav-link-btn"
            >
                ← Painel Administrativo (React)
            </a>
        </div>
    </header>
</template>

<script>
// componente de cabecalho da aplicacao vue com navegacao integrada
export default {
    name: 'Header'
};
</script>
