const HOLIDAY_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// servico de integracao externa com api de feriados nacionais com cache persistente por ano
export const holidayService = {
    // consulta feriados do brasil pelo ano corrente reutilizando localStorage
    getNationalHolidays: async (year = new Date().getFullYear(), forceRefresh = false) => {
        const storageKey = `bookstore_holidays_${year}`;
        if (!forceRefresh && typeof localStorage !== 'undefined') {
            try {
                const raw = localStorage.getItem(storageKey);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed?.items) && parsed.expiresAt > Date.now()) {
                        return parsed.items;
                    }
                }
            } catch {
                // ignora falha de leitura de storage
            }
        }

        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/BR`);
        if (!response.ok) {
            throw new Error(`erro http ${response.status}`);
        }
        const items = await response.json();

        if (Array.isArray(items) && typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem(
                    storageKey,
                    JSON.stringify({ items, expiresAt: Date.now() + HOLIDAY_CACHE_TTL_MS })
                );
            } catch {
                // ignora cota de storage excedida
            }
        }
        return items;
    }
};
