<template>
    <section>
        <div class="line">
            <h2>Feriados nacionais</h2>
            <button
                class="light"
                @click="loadHolidays(true)"
                :disabled="loading"
            >
                {{ loading ? 'Atualizando...' : 'Atualizar' }}
            </button>
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <div class="holidays" :aria-busy="loading">
            <template v-if="loading && !holidays.length">
                <article
                    v-for="index in 12"
                    :key="`skeleton-${index}`"
                    class="holiday-skeleton"
                    aria-hidden="true"
                >
                    <span class="skeleton-bar skeleton-title"></span>
                    <span class="skeleton-bar skeleton-date"></span>
                </article>
            </template>
            <template v-else>
                <article
                    v-for="holiday in holidays"
                    :key="holiday.date"
                >
                    <b>{{ holiday.localName }}</b>
                    <small>
                        {{ formatDate(holiday.date) }}
                    </small>
                </article>
            </template>
        </div>

        <p v-if="!holidays.length && !loading && !error">
            Nenhum feriado encontrado.
        </p>
    </section>
</template>

<script>
import { ref, onMounted } from 'vue';
import { holidayService } from '../services/holidayService';

const ptBrDateFormatter = new Intl.DateTimeFormat('pt-BR');

// componente para consulta e listagem de feriados sem chamadas duplicadas nem layout shift
export default {
    name: 'HolidayList',
    setup() {
        const holidays = ref([]);
        const error = ref('');
        const loading = ref(true);

        // formata a data reutilizando instancia unica de Intl.DateTimeFormat
        function formatDate(dateString) {
            return ptBrDateFormatter.format(new Date(dateString + 'T12:00:00'));
        }

        // consulta lista de feriados evitando chamadas concorrentes ou repetidas
        async function loadHolidays(force = false) {
            if (loading.value && holidays.value.length > 0 && !force) return;
            if (!force && holidays.value.length > 0) return;

            error.value = '';
            loading.value = true;
            try {
                holidays.value = await holidayService.getNationalHolidays(new Date().getFullYear(), force);
            } catch (err) {
                console.error('erro ao consultar feriados:', err);
                error.value = 'Não foi possível consultar os feriados. Tente novamente.';
            } finally {
                loading.value = false;
            }
        }

        onMounted(() => {
            loadHolidays();
        });

        return {
            holidays,
            error,
            loading,
            formatDate,
            loadHolidays
        };
    }
};
</script>
