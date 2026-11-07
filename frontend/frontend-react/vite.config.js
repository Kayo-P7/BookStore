import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '../../', '');
    const gatewayUrl = process.env.GATEWAY_URL;
    const reactPort = parseInt(env.REACT_PORT || '5173', 10);
    const catalogUrl = env.CATALOG_URL || `http://localhost:${env.CATALOG_SERVICE_PORT || 8081}`;
    const customerUrl = env.CUSTOMER_URL || `http://localhost:${env.CUSTOMER_SERVICE_PORT || 8082}`;
    const salesUrl = `http://localhost:${env.SALES_SERVICE_PORT || 8083}`;

    return {
        server: {
            host: '0.0.0.0',
            port: reactPort,
            proxy: gatewayUrl
                ? {
                    '/api': {
                        target: gatewayUrl,
                        changeOrigin: true
                    },
                    '/graphql': {
                        target: gatewayUrl,
                        changeOrigin: true
                    }
                }
                : {
                    '/api/catalog': {
                        target: catalogUrl,
                        changeOrigin: true
                    },
                    '/api/integrations': {
                        target: catalogUrl,
                        changeOrigin: true
                    },
                    '/graphql': {
                        target: catalogUrl,
                        changeOrigin: true
                    },
                    '/api/customers': {
                        target: customerUrl,
                        changeOrigin: true
                    },
                    '/api/sales': {
                        target: salesUrl,
                        changeOrigin: true
                    }
                }
        }
    };
});
