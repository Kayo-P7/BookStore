// utilitarios de mascaras para campos numericos e formatacao automatica com hifen

/**
 * Remove qualquer caractere nao numerico da string.
 */
export function onlyDigits(value: string | number | undefined | null): string {
    if (value === undefined || value === null) return '';
    return String(value).replace(/\D/g, '');
}

/**
 * Mascara para CEP brasileiro: 00000-000
 * Aceita somente digitos e insere o hifen (-) automaticamente apos o 5º digito.
 */
export function maskCep(value: string | undefined | null): string {
    const digits = onlyDigits(value).slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/**
 * Mascara para Telefone brasileiro:
 * Fixo (10 digitos): (00) 0000-0000
 * Celular (11 digitos): (00) 00000-0000
 * Aceita somente digitos e formata com parenteses, espaco e hifen (-) automaticamente.
 */
export function maskPhone(value: string | undefined | null): string {
    const digits = onlyDigits(value).slice(0, 11);
    if (!digits) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Mascara para numeros inteiros (Estoque, Quantidade).
 * Permite apenas digitos numericos (0-9) e limita o tamanho maximo.
 */
export function maskInteger(value: string | number | undefined | null, maxDigits = 8): string {
    return onlyDigits(value).slice(0, maxDigits);
}

/**
 * Mascara para valor monetario BRL (R$):
 * Digitando 4990 -> formata como R$ 49,90 e extrai 49.90 como numero decimal.
 */
export function maskMoney(value: string | number | undefined | null): {
    formatted: string;
    numeric: number;
} {
    const digits = onlyDigits(value);
    if (!digits) {
        return { formatted: '', numeric: 0 };
    }
    const cents = parseInt(digits, 10);
    const numeric = cents / 100;
    const formatted = numeric.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return {
        formatted: `R$ ${formatted}`,
        numeric
    };
}

/**
 * Converte valor formatado em moeda (ex: "R$ 49,90" ou "49,90") em numero decimal puro (49.9).
 */
export function parseMoney(value: string | number | undefined | null): number {
    const digits = onlyDigits(value);
    if (!digits) return 0;
    return parseInt(digits, 10) / 100;
}

/**
 * Interceptador onKeyDown para garantir que o campo aceite exclusivamente digitos numericos (0-9)
 * e teclas de controle necessarias (Backspace, Tab, Setas, Delete, Ctrl+C, Ctrl+V, etc.).
 */
export function handleNumericKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Permite teclas de navegacao e edicao essenciais
    const allowedKeys = [
        'Backspace',
        'Tab',
        'Enter',
        'Delete',
        'Escape',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End'
    ];

    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
        return;
    }

    // Bloqueia qualquer caractere que nao seja digito numerico (0-9)
    if (!/^\d$/.test(e.key)) {
        e.preventDefault();
    }
}
