// cliente http base para requisicoes api com tratamento de resposta e autenticacao jwt
export async function httpClient(url, options = {}) {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('bookstore_token') : null;

    const headers = {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401 && !url.includes('/api/auth/login')) {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('bookstore_token');
            localStorage.removeItem('bookstore_user');
        }
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
            window.location.href = '/auth/login';
        }
    }

    if (!response.ok) {
        const body = await response.text();
        throw new Error(body || `erro http ${response.status}`);
    }

    if (response.status === 204) return null;

    const body = await response.text();
    return body ? JSON.parse(body) : null;
}
