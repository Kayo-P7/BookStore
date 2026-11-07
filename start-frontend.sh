#!/usr/bin/env bash

# ==============================================================================
# BookStore — Script de Inicializacao dos Frontends (React e Vue.js)
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Definicao de cores para o terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}=====================================================${NC}"
echo -e "${CYAN}${BOLD}         BookStore — Interfaces Frontend             ${NC}"
echo -e "${CYAN}${BOLD}=====================================================${NC}"

# 1. Verificacao de ferramentas necessarias
if ! command -v node &>/dev/null; then
    echo -e "${RED}[X] Erro: Node.js nao foi encontrado no PATH.${NC}"
    exit 1
fi

if ! command -v npm &>/dev/null; then
    echo -e "${RED}[X] Erro: npm nao foi encontrado no PATH.${NC}"
    exit 1
fi

TARGET_FRONTEND="${1:-all}"

# 2. Verificacao de portas ocupadas
check_port() {
    local port=$1
    local pid
    pid=$(lsof -ti :"$port" 2>/dev/null || true)
    if [ -n "$pid" ]; then
        echo -e "${RED}[X] Erro: A porta ${port} ja esta em uso pelo processo PID ${pid}.${NC}"
        echo -e "${YELLOW}    Encerre o processo anterior com: kill -9 ${pid} ou execute ./stop-local.sh${NC}"
        return 1
    fi
    return 0
}

case "$TARGET_FRONTEND" in
    react)
        check_port 5173 || exit 1
        ;;
    vue)
        check_port 5174 || exit 1
        ;;
    all|both|"")
        check_port 5173 || exit 1
        check_port 5174 || exit 1
        ;;
    *)
        echo -e "${RED}[X] Opcao invalida: ${TARGET_FRONTEND}${NC}"
        echo -e "Uso: $0 [all|react|vue]"
        exit 1
        ;;
esac

# 3. Verificacao de dependencias (node_modules)
ensure_dependencies() {
    local dir=$1
    local name=$2
    if [ ! -d "$dir/node_modules" ]; then
        echo -e "${YELLOW}[!] Dependencias nao encontradas para ${name}. Executando 'npm install'...${NC}"
        npm --prefix "$dir" install
        echo -e "${GREEN}[OK] Dependencias instaladas para ${name}.${NC}"
    fi
}

mkdir -p logs

declare -a PIDS=()

cleanup() {
    echo -e "\n${YELLOW}[BookStore] Encerrando servidores frontend...${NC}"
    for pid in "${PIDS[@]}"; do
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            pkill -P "$pid" 2>/dev/null || true
            kill "$pid" 2>/dev/null || true
        fi
    done
    # Encerramento preventivo via porta
    for port in 5173 5174; do
        fuser -k "${port}/tcp" 2>/dev/null || true
    done
    echo -e "${GREEN}[BookStore] Todos os frontends foram finalizados.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 4. Inicializacao dos frontends
start_react() {
    ensure_dependencies "frontend/frontend-react" "frontend-react"
    echo -e "${BLUE}-> Iniciando React (Vite) na porta 5173...${NC}"
    npm --prefix frontend/frontend-react run dev > logs/frontend-react.log 2>&1 &
    local pid=$!
    PIDS+=("$pid")
    sleep 2
    if ! kill -0 "$pid" 2>/dev/null; then
        echo -e "${RED}[X] Erro ao iniciar frontend React!${NC}"
        tail -n 15 logs/frontend-react.log
        exit 1
    fi
    echo -e "${GREEN}[OK] Frontend React ativo em http://localhost:5173${NC}"
}

start_vue() {
    ensure_dependencies "frontend/frontend-vue" "frontend-vue"
    echo -e "${BLUE}-> Iniciando Vue (Vite) na porta 5174...${NC}"
    npm --prefix frontend/frontend-vue run dev > logs/frontend-vue.log 2>&1 &
    local pid=$!
    PIDS+=("$pid")
    sleep 2
    if ! kill -0 "$pid" 2>/dev/null; then
        echo -e "${RED}[X] Erro ao iniciar frontend Vue!${NC}"
        tail -n 15 logs/frontend-vue.log
        exit 1
    fi
    echo -e "${GREEN}[OK] Frontend Vue ativo em http://localhost:5174${NC}"
}

if [ "$TARGET_FRONTEND" = "all" ] || [ "$TARGET_FRONTEND" = "both" ] || [ -z "$TARGET_FRONTEND" ]; then
    start_react
    start_vue
elif [ "$TARGET_FRONTEND" = "react" ]; then
    start_react
elif [ "$TARGET_FRONTEND" = "vue" ]; then
    start_vue
fi

echo -e "\n${GREEN}${BOLD}=====================================================${NC}"
echo -e "${GREEN}${BOLD}       Frontends Prontos para Navegacao!             ${NC}"
echo -e "${GREEN}${BOLD}=====================================================${NC}"
if [ "$TARGET_FRONTEND" = "all" ] || [ "$TARGET_FRONTEND" = "both" ] || [ "$TARGET_FRONTEND" = "react" ]; then
    echo -e " • React SPA: ${CYAN}http://localhost:5173${NC} (logs: logs/frontend-react.log)"
fi
if [ "$TARGET_FRONTEND" = "all" ] || [ "$TARGET_FRONTEND" = "both" ] || [ "$TARGET_FRONTEND" = "vue" ]; then
    echo -e " • Vue SPA:   ${CYAN}http://localhost:5174${NC} (logs: logs/frontend-vue.log)"
fi
echo -e "-----------------------------------------------------"
echo -e " Acompanhar logs: ${YELLOW}tail -f logs/frontend-*.log${NC}"
echo -e "-----------------------------------------------------"
echo -e "${YELLOW}Pressione Ctrl+C para encerrar.${NC}\n"

wait
