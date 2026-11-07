// cliente http base para requisicoes api com tratamento de resposta
export async function httpClient(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        const body = await response.text();
        throw new Error(body || `erro http ${response.status}`);
    }

    if (response.status === 204) return null;

    const body = await response.text();
    return body ? JSON.parse(body) : null;
}
