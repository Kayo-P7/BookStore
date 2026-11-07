<template>
    <main :class="{ 'is-embedded': isEmbedded }">
        <Header v-if="!isEmbedded" />
        <CepLookup />
        <HolidayList />
        <footer v-if="!isEmbedded">BookStore • Sistema acadêmico</footer>
    </main>
</template>

<script>
import Header from './components/Header.vue';
import CepLookup from './components/CepLookup.vue';
import HolidayList from './components/HolidayList.vue';

// componente raiz da aplicacao vue com deteccao de tema e modo incorporado
export default {
    name: 'App',
    components: {
        Header,
        CepLookup,
        HolidayList
    },
    data() {
        return {
            isEmbedded: window.self !== window.top,
            theme: 'light'
        };
    },
    mounted() {
        const savedTheme = localStorage.getItem('bookstore-theme') || 'light';
        this.applyTheme(savedTheme);

        // escuta alteracao de tema enviada pelo portal react
        window.addEventListener('message', this.handleThemeMessage);
    },
    beforeUnmount() {
        window.removeEventListener('message', this.handleThemeMessage);
    },
    methods: {
        applyTheme(theme) {
            this.theme = theme;
            document.documentElement.setAttribute('data-theme', theme);
        },
        handleThemeMessage(e) {
            if (e.data && e.data.type === 'THEME_CHANGE') {
                this.applyTheme(e.data.theme);
            }
        }
    }
};
</script>
