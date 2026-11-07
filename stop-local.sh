#!/usr/bin/env bash

# ==============================================================================
# BookStore — Script para Interromper Todos os Servicos Locais
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}=====================================================${NC}"
echo -e "${CYAN}${BOLD}     BookStore — Parada de Servicos Locais           ${NC}"
echo -e "${CYAN}${BOLD}=====================================================${NC}"

stop_port() {
    local port=$1
    local name=$2
    local pids
    pids=$(lsof -ti :"$port" 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}-> Encerrando ${name} na porta ${port} (PID: ${pids})...${NC}"
        fuser -k -9 "${port}/tcp" 2>/dev/null || kill -9 $pids 2>/dev/null || true
        echo -e "${GREEN}[OK] Porta ${port} liberada.${NC}"
    else
        echo -e " • Porta ${port} (${name}): ja esta livre."
    fi
}

stop_port 8081 "Catalog Service"
stop_port 8082 "Customer Service"
stop_port 8083 "Sales Service"
stop_port 5173 "Frontend React"
stop_port 5174 "Frontend Vue"

echo -e "\n${GREEN}${BOLD}Todos os servicos locais foram finalizados com sucesso!${NC}\n"
