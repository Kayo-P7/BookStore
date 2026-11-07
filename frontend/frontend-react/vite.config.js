import { defineConfig } from 'vite';

const gatewayUrl = process.env.GATEWAY_URL;

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 5173,
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
                    target: 'http://localhost:8081',
                    changeOrigin: true
                },
                '/api/integrations': {
                    target: 'http://localhost:8081',
                    changeOrigin: true
                },
                '/graphql': {
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
