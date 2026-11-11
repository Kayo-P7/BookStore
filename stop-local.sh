#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}[BookStore] Parada de Servicos Locais${NC}"

read_env_port() {
    local var_name=$1
    local default_val=$2
    local val
    val=$(grep -E "^${var_name}=" .env 2>/dev/null | tail -n 1 | cut -d '=' -f2 | tr -d ' "\r' || true)
    echo "${val:-$default_val}"
}

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
        echo -e " • Porta ${port} (${name}): livre."
    fi
}

stop_port "$(read_env_port CATALOG_SERVICE_PORT 8081)" "Catalog Service"
stop_port "$(read_env_port CUSTOMER_SERVICE_PORT 8082)" "Customer Service"
stop_port "$(read_env_port SALES_SERVICE_PORT 8083)" "Sales Service"
stop_port "$(read_env_port LOAN_SERVICE_PORT 8085)" "Loan Service"
stop_port "$(read_env_port REACT_PORT 5173)" "Frontend React"
stop_port "$(read_env_port VUE_PORT 5174)" "Frontend Vue"

echo -e "\n${GREEN}${BOLD}Todos os servicos locais foram finalizados.${NC}\n"
