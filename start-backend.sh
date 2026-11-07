#!/usr/bin/env bash

# ==============================================================================
# BookStore — Script de Inicializacao dos Microsservicos Backend
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
echo -e "${CYAN}${BOLD}       BookStore — Microsservicos Backend            ${NC}"
echo -e "${CYAN}${BOLD}=====================================================${NC}"

# 1. Verificacao de arquivo .env
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}[!] Arquivo .env nao encontrado. Criando copia a partir de .env.example...${NC}"
        cp .env.example .env
        echo -e "${GREEN}[OK] Arquivo .env criado.${NC}"
    else
        echo -e "${RED}[X] Erro: Arquivo .env nao encontrado na raiz do repositorio.${NC}"
        exit 1
    fi
fi

# 2. Verificacao de ferramentas necessarias
if ! command -v java &>/dev/null; then
    echo -e "${RED}[X] Erro: Java JDK nao foi encontrado no PATH.${NC}"
    exit 1
fi

if ! command -v mvn &>/dev/null; then
    echo -e "${RED}[X] Erro: Apache Maven (mvn) nao foi encontrado no PATH.${NC}"
    exit 1
fi

# 3. Verificacao de conexao com o PostgreSQL
DB_PORT=$(grep -E '^POSTGRES_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' "\r' || true)
[ -z "$DB_PORT" ] && DB_PORT=5432
if ! (echo > /dev/tcp/localhost/"$DB_PORT") 2>/dev/null; then
    echo -e "${YELLOW}[!] Aviso: Nao foi detectada conexao com o PostgreSQL na porta ${DB_PORT}.${NC}"
    echo -e "${YELLOW}    Certifique-se de que o banco de dados esteja ativo antes de iniciar os servicos.${NC}\n"
fi

# 4. Verificacao de portas ocupadas
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

TARGET_SERVICE="${1:-all}"

case "$TARGET_SERVICE" in
    catalog)
        check_port 8081 || exit 1
        ;;
    customer)
        check_port 8082 || exit 1
        ;;
    sales)
        check_port 8083 || exit 1
        ;;
    all|"")
        check_port 8081 || exit 1
        check_port 8082 || exit 1
        check_port 8083 || exit 1
        ;;
    *)
        echo -e "${RED}[X] Servico invalido: ${TARGET_SERVICE}${NC}"
        echo -e "Uso: $0 [all|catalog|customer|sales]"
        exit 1
        ;;
esac

mkdir -p logs

declare -a PIDS=()

cleanup() {
    echo -e "\n${YELLOW}[BookStore] Encerrando servicos em segundo plano...${NC}"
    for pid in "${PIDS[@]}"; do
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            pkill -P "$pid" 2>/dev/null || true
            kill "$pid" 2>/dev/null || true
        fi
    done
    # Encerramento preventivo via porta caso reste processo filho
    for port in 8081 8082 8083; do
        fuser -k "${port}/tcp" 2>/dev/null || true
    done
    echo -e "${GREEN}[BookStore] Todos os microsservicos backend foram finalizados.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

wait_for_health() {
    local name=$1
    local port=$2
    local pid=$3
    local log_file="logs/${name}.log"
    local elapsed=0
    local timeout=90

    echo -ne "   ${BLUE}[...] Aguardando ${name} responder na porta ${port}...${NC}"
    while [ $elapsed -lt $timeout ]; do
        if ! kill -0 "$pid" 2>/dev/null; then
            echo -e "\r${RED}[X] ${name} falhou ao iniciar (processo encerrou).${NC}"
            echo -e "${YELLOW}--- Ultimas 20 linhas de ${log_file} ---${NC}"
            tail -n 20 "$log_file" 2>/dev/null || true
            echo -e "${YELLOW}-----------------------------------------${NC}"
            exit 1
        fi

        if curl -s "http://localhost:${port}/actuator/health" 2>/dev/null | grep -q '"status":"UP"'; then
            echo -e "\r${GREEN}[OK] ${name} ativo em http://localhost:${port}${NC}       "
            return 0
        fi

        sleep 2
        elapsed=$((elapsed + 2))
    done

    echo -e "\r${YELLOW}[!] ${name} (PID ${pid}) ainda iniciando; verifique logs/${name}.log.${NC}       "
    return 0
}

start_service() {
    local name=$1
    local port=$2
    local log_file="logs/${name}.log"

    echo -e "${CYAN}-> Iniciando ${name} (logs em ${log_file})...${NC}"
    mvn spring-boot:run -f backend/pom.xml -pl "$name" > "$log_file" 2>&1 &
    local pid=$!
    PIDS+=("$pid")
    echo "$pid"
}

if [ "$TARGET_SERVICE" = "all" ] || [ -z "$TARGET_SERVICE" ]; then
    echo -e "${BLUE}[Fase 1/2] Iniciando servicos base: catalog-service e customer-service...${NC}"
    PID_CATALOG=$(start_service "catalog-service" 8081)
    PID_CUSTOMER=$(start_service "customer-service" 8082)

    wait_for_health "catalog-service" 8081 "$PID_CATALOG"
    wait_for_health "customer-service" 8082 "$PID_CUSTOMER"

    echo -e "\n${BLUE}[Fase 2/2] Iniciando servico dependente: sales-service...${NC}"
    PID_SALES=$(start_service "sales-service" 8083)
    wait_for_health "sales-service" 8083 "$PID_SALES"

elif [ "$TARGET_SERVICE" = "catalog" ]; then
    PID=$(start_service "catalog-service" 8081)
    wait_for_health "catalog-service" 8081 "$PID"

elif [ "$TARGET_SERVICE" = "customer" ]; then
    PID=$(start_service "customer-service" 8082)
    wait_for_health "customer-service" 8082 "$PID"

elif [ "$TARGET_SERVICE" = "sales" ]; then
    PID=$(start_service "sales-service" 8083)
    wait_for_health "sales-service" 8083 "$PID"
fi

echo -e "\n${GREEN}${BOLD}=====================================================${NC}"
echo -e "${GREEN}${BOLD}   Microsservicos Backend Prontos para Uso!          ${NC}"
echo -e "${GREEN}${BOLD}=====================================================${NC}"
echo -e " • Catalog Service:   ${CYAN}http://localhost:8081${NC} (Health: /actuator/health | GraphQL: /graphql)"
echo -e " • Customer Service:  ${CYAN}http://localhost:8082${NC} (Health: /actuator/health)"
echo -e " • Sales Service:     ${CYAN}http://localhost:8083${NC} (Health: /actuator/health)"
echo -e "-----------------------------------------------------"
echo -e " Arquivos de log:     ${BOLD}logs/catalog-service.log${NC}"
echo -e "                      ${BOLD}logs/customer-service.log${NC}"
echo -e "                      ${BOLD}logs/sales-service.log${NC}"
echo -e " Acompanhar em tempo real: ${YELLOW}tail -f logs/*.log${NC}"
echo -e "-----------------------------------------------------"
echo -e "${YELLOW}Pressione Ctrl+C para encerrar todos os servicos.${NC}\n"

# Aguarda os processos filhos em background
wait
