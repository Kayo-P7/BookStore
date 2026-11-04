import { createApp, ref, onMounted } from 'vue';
import './style.css';

const App = {
    setup() {
        const cep = ref('');
        const address = ref(null);
        const holidays = ref([]);

        const cepError = ref('');
        const holidayError = ref('');

        const loadingCep = ref(false);
        const loadingHolidays = ref(false);

        async function findCep() {
            cepError.value = '';
            address.value = null;

            const cepLimpo = cep.value.replace(/\D/g, '');

            if (cepLimpo.length !== 8) {
                cepError.value = 'Digite um CEP válido com 8 números.';
                return;
            }

            loadingCep.value = true;

            try {
                const response = await fetch(
                    `/api/customers/cep/${cepLimpo}`
                );

                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }

                const data = await response.json();

                if (data.erro) {
                    cepError.value = 'CEP não encontrado.';
                    return;
                }

                address.value = data;

            } catch (error) {
                console.error('Erro ao consultar ViaCEP:', error);

                cepError.value =
                    'Não foi possível consultar o CEP. Tente novamente.';
            } finally {
                loadingCep.value = false;
            }
        }

        async function findHolidays() {
            holidayError.value = '';
            loadingHolidays.value = true;

            try {
                const year = new Date().getFullYear();

                const response = await fetch(
                    `https://date.nager.at/api/v3/PublicHolidays/${year}/BR`
                );

                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }

                const data = await response.json();

                holidays.value = data;

            } catch (error) {
                console.error('Erro ao consultar feriados:', error);

                holidayError.value =
                    'Não foi possível consultar os feriados. Tente novamente.';
            } finally {
                loadingHolidays.value = false;
            }
        }

        onMounted(() => {
            findHolidays();
        });

        return {
            cep,
            address,
            holidays,
            cepError,
            holidayError,
            loadingCep,
            loadingHolidays,
            findCep,
            findHolidays
        };
    },

    template: `
        <main>
            <header>
                <div>
                    <small>BOOKSTORE • SERVIÇOS AO CLIENTE</small>

                    <h1>Informações e consultas</h1>

                    <p>
                        Consulta de endereço e calendário de feriados.
                    </p>
                </div>

                <span>Vue.js</span>
            </header>

            <section>
                <h2>Consultar endereço por CEP</h2>

                <div class="line">
                    <input
                        v-model="cep"
                        placeholder="Digite o CEP"
                        maxlength="9"
                        @keyup.enter="findCep"
                    />

                    <button
                        @click="findCep"
                        :disabled="loadingCep"
                    >
                        {{ loadingCep ? 'Consultando...' : 'Consultar ViaCEP' }}
                    </button>
                </div>

                <div
                    v-if="address"
                    class="result"
                >
                    <b>{{ address.logradouro || 'Logradouro não informado' }}</b>

                    <p>
                        {{ address.bairro || 'Bairro não informado' }}
                        •
                        {{ address.localidade }} / {{ address.uf }}
                    </p>

                    <small>CEP: {{ address.cep }}</small>
                </div>

                <p
                    v-if="cepError"
                    class="error"
                >
                    {{ cepError }}
                </p>
            </section>

            <section>
                <div class="line">
                    <h2>Feriados nacionais</h2>

                    <button
                        class="light"
                        @click="findHolidays"
                        :disabled="loadingHolidays"
                    >
                        {{ loadingHolidays ? 'Atualizando...' : 'Atualizar' }}
                    </button>
                </div>

                <p
                    v-if="holidayError"
                    class="error"
                >
                    {{ holidayError }}
                </p>

                <div class="holidays">
                    <article
                        v-for="holiday in holidays"
                        :key="holiday.date"
                    >
                        <b>{{ holiday.localName }}</b>

                        <small>
                            {{
                                new Date(
                                    holiday.date + 'T12:00:00'
                                ).toLocaleDateString('pt-BR')
                            }}
                        </small>
                    </article>
                </div>

                <p v-if="!holidays.length && !loadingHolidays && !holidayError">
                    Nenhum feriado encontrado.
                </p>
            </section>

            <footer>
                BookStore • Sistema acadêmico
            </footer>
        </main>
    `
};

createApp(App).mount('#app');