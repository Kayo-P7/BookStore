<template>
    <main>
        <Header />
        <CepLookup />
        <HolidayList />
        <footer>BookStore • Sistema acadêmico</footer>
    </main>
</template>

<script>
import Header from './components/Header.vue';
import CepLookup from './components/CepLookup.vue';
import HolidayList from './components/HolidayList.vue';

// componente raiz da aplicacao vue
export default {
    name: 'App',
    components: {
        Header,
        CepLookup,
        HolidayList
    }
};
</script>
