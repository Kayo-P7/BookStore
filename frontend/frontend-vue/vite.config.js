import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const gatewayUrl = process.env.GATEWAY_URL;

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm-bundler.js'
        }
    },
    server: {
        host: '0.0.0.0',
        port: 5174,
        proxy: gatewayUrl
            ? {
                '/api': {
                    target: gatewayUrl,
                    changeOrigin: true
                }
            }
            : {
                '/api/catalog': {
                    target: 'http://localhost:8081',
                    changeOrigin: true
                },
                '/api/integrations': {
                    target: 'http://localhost:8081',
                    changeOrigin: true
                },
                '/api/customers': {
                    target: 'http://localhost:8082',
                    changeOrigin: true
                },
                '/api/sales': {
                    target: 'http://localhost:8083',
                    changeOrigin: true
                }
            }
    }
});
