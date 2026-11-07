<template>
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
                :disabled="loading"
            >
                {{ loading ? 'Consultando...' : 'Consultar ViaCEP' }}
            </button>
        </div>

        <div v-if="address" class="result">
            <b>{{ address.logradouro || 'Logradouro não informado' }}</b>
            <p>
                {{ address.bairro || 'Bairro não informado' }}
                •
                {{ address.localidade }} / {{ address.uf }}
            </p>
            <small>CEP: {{ address.cep }}</small>
        </div>

        <p v-if="error" class="error">{{ error }}</p>
    </section>
</template>

<script>
import { ref } from 'vue';
import { customerService } from '../services/customerService';

// componente para consulta e exibicao de dados de cep sem chamadas repetidas
export default {
    name: 'CepLookup',
    setup() {
        const cep = ref('');
        const address = ref(null);
        const error = ref('');
        const loading = ref(false);
        const lastSearchedCep = ref('');

        // executa busca de cep evitando consultas redundantes do mesmo valor
        async function findCep() {
            const cleanCep = cep.value.replace(/\D/g, '');
            if (cleanCep.length !== 8) {
                error.value = 'Digite um CEP válido com 8 números.';
                return;
            }

            if (cleanCep === lastSearchedCep.value && address.value) {
                return;
            }

            error.value = '';
            address.value = null;
            loading.value = true;

            try {
                const data = await customerService.lookupCep(cleanCep);
                if (data.erro) {
                    error.value = 'CEP não encontrado.';
                    return;
                }
                address.value = data;
                lastSearchedCep.value = cleanCep;
            } catch (err) {
                console.error('erro ao consultar viacep:', err);
                error.value = 'Não foi possível consultar o CEP. Tente novamente.';
            } finally {
                loading.value = false;
            }
        }

        return {
            cep,
            address,
            error,
            loading,
            findCep
        };
    }
};
</script>
