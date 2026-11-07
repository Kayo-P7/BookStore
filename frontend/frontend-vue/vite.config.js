import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '../../', '');
    const gatewayUrl = env.GATEWAY_URL;
    const vuePort = parseInt(env.VUE_PORT, 10);
    const catalogUrl = env.CATALOG_URL;
    const customerUrl = env.CUSTOMER_URL;
    const salesUrl = `http://localhost:${env.SALES_SERVICE_PORT}`;

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
                    }
                }
        }
    };
});
