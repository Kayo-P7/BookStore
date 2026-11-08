import { httpClient } from './httpClient';

const BASE_URL = '/api/auth';

// servico para autenticacao e gestao de sessao de operadores
export const authService = {
    // autentica operador por email e senha
    login: credentials =>
        httpClient(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        }),

    // renova token jwt utilizando refresh token
    refreshToken: refreshToken =>
        httpClient(`${BASE_URL}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        }),

    // altera a senha do operador no primeiro acesso ou atualizacao de credencial
    changePassword: payload =>
        httpClient(`${BASE_URL}/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
};
