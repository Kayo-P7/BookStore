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

        <div class="holidays">
            <article
                v-for="holiday in holidays"
                :key="holiday.date"
            >
                <b>{{ holiday.localName }}</b>
                <small>
                    {{ formatDate(holiday.date) }}
                </small>
            </article>
        </div>

        <p v-if="!holidays.length && !loading && !error">
            Nenhum feriado encontrado.
        </p>
    </section>
</template>

<script>
import { ref, onMounted } from 'vue';
import { holidayService } from '../services/holidayService';

// componente para consulta e listagem de feriados sem chamadas duplicadas
export default {
    name: 'HolidayList',
    setup() {
        const holidays = ref([]);
        const error = ref('');
        const loading = ref(false);

        // formata a data para formato pt-br
        function formatDate(dateString) {
            return new Date(dateString + 'T12:00:00').toLocaleDateString('pt-BR');
        }

        // consulta lista de feriados evitando chamadas concorrentes ou repetidas
        async function loadHolidays(force = false) {
            if (loading.value) return;
            if (!force && holidays.value.length > 0) return;

            error.value = '';
            loading.value = true;
            try {
                holidays.value = await holidayService.getNationalHolidays();
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
