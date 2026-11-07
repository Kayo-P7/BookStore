import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '../../', '');
    const gatewayUrl = env.GATEWAY_URL;
    const reactPort = parseInt(env.REACT_PORT, 10);
    const catalogUrl = env.CATALOG_URL;
    const customerUrl = env.CUSTOMER_URL;
    const salesUrl = `http://localhost:${env.SALES_SERVICE_PORT}`;

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
