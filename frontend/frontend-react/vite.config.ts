import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '../../', '');
    const gatewayUrl = process.env.GATEWAY_URL;
    const reactPort = parseInt(env.REACT_PORT || '5173', 10);
    const catalogUrl = env.CATALOG_URL || `http://localhost:${env.CATALOG_SERVICE_PORT || 8081}`;
    const customerUrl = env.CUSTOMER_URL || `http://localhost:${env.CUSTOMER_SERVICE_PORT || 8082}`;
    const salesUrl = `http://localhost:${env.SALES_SERVICE_PORT || 8083}`;
    const loanUrl = env.LOAN_URL || `http://localhost:${env.LOAN_SERVICE_PORT || 8085}`;

    return {
        plugins: [
            react(),
            tailwindcss()
        ],
        resolve: {
            alias: {
                '@': path.resolve(process.cwd(), './src')
            }
        },
        build: {
            rolldownOptions: {
                output: {
                    codeSplitting: {
                        minSize: 15000,
                        groups: [
                            {
                                name: 'vendor-forms',
                                test: /[\\/]node_modules[\\/](zod|react-hook-form|@hookform)[\\/]/,
                                priority: 30
                            },
                            {
                                name: 'vendor-react',
                                test: /[\\/]node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
                                priority: 20
                            },
                            {
                                name: 'vendor-ui',
                                test: /[\\/]node_modules[\\/](lucide-react|@base-ui|clsx|tailwind-merge)[\\/]/,
                                priority: 10
                            },
                            {
                                name: 'app-shared',
                                test: /[\\/]src[\\/](components|services|utils|layouts)[\\/]/,
                                minShareCount: 2,
                                priority: 5
                            }
                        ]
                    }
                }
            }
        },
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
                    '/api/auth': {
                        target: customerUrl,
                        changeOrigin: true
                    },
                    '/api/users': {
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
