// utilitario para resolucao dinamica da url do modulo frontend vue
export function getVueUrl(): string {
    if (import.meta.env.VITE_VUE_URL) {
        return import.meta.env.VITE_VUE_URL;
    }
    if (typeof window !== 'undefined') {
        // em desenvolvimento local (porta 5173), aponta para a porta 5174 do vite dev
        if (window.location.port === '5173') {
            return 'http://localhost:5174';
        }
        // em producao/vps, usa o mesmo host acessado pelo usuario na porta 8090
        return `${window.location.protocol}//${window.location.hostname}:8090`;
    }
    return 'http://localhost:5174';
}
