// servico de consulta de cep integrado ao backend
export const customerService = {
    // consulta endereco por cep atraves do microsservico de clientes
    lookupCep: async cep => {
        const response = await fetch(`/api/customers/cep/${cep}`);
        if (!response.ok) {
            throw new Error(`erro http ${response.status}`);
        }
        return response.json();
    }
};
