const cepMemoryCache = new Map();

// servico de consulta de cep integrado ao backend com cache em memoria
export const customerService = {
    // consulta endereco por cep atraves do microsservico de clientes
    lookupCep: async cep => {
        const cleanCep = String(cep || '').replace(/\D/g, '');
        if (cepMemoryCache.has(cleanCep)) {
            return cepMemoryCache.get(cleanCep);
        }
        const response = await fetch(`/api/customers/cep/${cleanCep}`);
        if (!response.ok) {
            throw new Error(`erro http ${response.status}`);
        }
        const data = await response.json();
        if (data && !data.erro) {
            cepMemoryCache.set(cleanCep, data);
        }
        return data;
    }
};
