// cache leve em memoria com deduplicacao de requisicoes em voo para transicoes instantaneas entre abas
const responseCache = new Map();
const inflightRequests = new Map();
const MAX_CACHE_SIZE = 64;

function buildCacheKey(url) {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('bookstore_token') || 'anon' : 'anon';
    return `${token}:${url}`;
}

export function invalidateHttpCache(urlPrefix = '') {
    if (!urlPrefix) {
        responseCache.clear();
        inflightRequests.clear();
        return;
    }
    for (const key of responseCache.keys()) {
        if (key.includes(urlPrefix)) {
            responseCache.delete(key);
        }
    }
    for (const key of inflightRequests.keys()) {
        if (key.includes(urlPrefix)) {
            inflightRequests.delete(key);
        }
    }
}

// extrai mensagem legivel de respostas json ou problem detail sem perder o status http
function extractErrorMessage(body, status) {
    if (!body) return `erro http ${status}`;
    try {
        const parsed = JSON.parse(body);
        const extracted = parsed?.detail || parsed?.message || parsed?.error;
        if (extracted) {
            return status === 401 && !String(extracted).includes('401')
                ? `${extracted} (401)`
                : String(extracted);
        }
    } catch {
        // mantem corpo textual quando nao for json
    }
    return body;
}

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
        invalidateHttpCache();
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
        throw new Error(extractErrorMessage(body, response.status));
    }

    if (response.status === 204) return null;

    const body = await response.text();
    if (!body) return null;
    try {
        return JSON.parse(body);
    } catch {
        return body;
    }
}

// executa consulta cacheavel deduplicando chamadas simultaneas para a mesma rota
export function cachedRequest(cacheKeySuffix, fetcher, ttlMs = 30000) {
    const key = buildCacheKey(cacheKeySuffix);
    const now = Date.now();
    const cached = responseCache.get(key);
    if (cached && cached.expiresAt > now) {
        return Promise.resolve(cached.data);
    }

    const inflight = inflightRequests.get(key);
    if (inflight) {
        return inflight;
    }

    const promise = Promise.resolve()
        .then(fetcher)
        .then(data => {
            if (responseCache.size >= MAX_CACHE_SIZE) {
                const oldestKey = responseCache.keys().next().value;
                if (oldestKey) responseCache.delete(oldestKey);
            }
            responseCache.set(key, { data, expiresAt: Date.now() + ttlMs });
            inflightRequests.delete(key);
            return data;
        })
        .catch(err => {
            inflightRequests.delete(key);
            throw err;
        });

    inflightRequests.set(key, promise);
    return promise;
}
