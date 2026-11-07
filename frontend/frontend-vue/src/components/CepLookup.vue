<template>
    <section>
        <h2>Consultar endereço por CEP</h2>

        <div class="line">
            <input
                v-model="cep"
                placeholder="00000-000"
                maxlength="9"
                inputmode="numeric"
                @keydown="handleKeyDown"
                @input="handleInput"
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

// componente para consulta e exibicao de dados de cep com mascara automatica
export default {
    name: 'CepLookup',
    setup() {
        const cep = ref('');
        const address = ref(null);
        const error = ref('');
        const loading = ref(false);
        const lastSearchedCep = ref('');

        // mascara para cep: formata automaticamente com hifen e aceita somente numeros
        function maskCep(value) {
            const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
            if (digits.length <= 5) return digits;
            return `${digits.slice(0, 5)}-${digits.slice(5)}`;
        }

        // bloqueia caracteres nao numericos no keydown
        function handleKeyDown(e) {
            const allowed = [
                'Backspace', 'Tab', 'Enter', 'Delete', 'Escape',
                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                'Home', 'End'
            ];
            if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) {
                return;
            }
            if (!/^\d$/.test(e.key)) {
                e.preventDefault();
            }
        }

        // formata o input e dispara a busca automatica ao completar 8 digitos
        function handleInput(e) {
            const masked = maskCep(e.target.value);
            cep.value = masked;
            const digits = masked.replace(/\D/g, '');
            if (digits.length === 8 && digits !== lastSearchedCep.value) {
                findCep();
            }
        }

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
            findCep,
            handleKeyDown,
            handleInput
        };
    }
};
</script>
