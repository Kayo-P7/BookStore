import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '../../', '');
    const gatewayUrl = process.env.GATEWAY_URL;
    const vuePort = parseInt(env.VUE_PORT || '5174', 10);
    const catalogUrl = env.CATALOG_URL || `http://localhost:${env.CATALOG_SERVICE_PORT || 8081}`;
    const customerUrl = env.CUSTOMER_URL || `http://localhost:${env.CUSTOMER_SERVICE_PORT || 8082}`;
    const salesUrl = `http://localhost:${env.SALES_SERVICE_PORT || 8083}`;
    const loanUrl = env.LOAN_URL || `http://localhost:${env.LOAN_SERVICE_PORT || 8085}`;

    return {
        plugins: [vue()],
        resolve: {
            alias: {
                vue: 'vue/dist/vue.esm-bundler.js'
            }
        },
        server: {
            host: '0.0.0.0',
            port: vuePort,
            proxy: gatewayUrl
                ? {
                    '/api': {
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
                    '/api/customers': {
                        target: customerUrl,
                        changeOrigin: true
                    },
                    '/api/sales': {
                        target: salesUrl,
                        changeOrigin: true
                    },
                    '/api/loans': {
                        target: loanUrl,
                        changeOrigin: true
                    }
                }
        }
    };
});
