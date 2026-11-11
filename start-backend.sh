#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}[BookStore] Inicializacao dos Microsservicos Backend${NC}"

# validacao do arquivo de ambiente
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

# validacao de ferramentas no path
if ! command -v java &>/dev/null; then
    echo -e "${RED}[X] Erro: Java JDK nao foi encontrado no PATH.${NC}"
    exit 1
fi

if ! command -v mvn &>/dev/null; then
    echo -e "${RED}[X] Erro: Apache Maven (mvn) nao foi encontrado no PATH.${NC}"
    exit 1
fi

read_env_var() {
    local var_name=$1
    local default_val=$2
    local val
    val=$(grep -E "^${var_name}=" .env 2>/dev/null | tail -n 1 | cut -d '=' -f2 | tr -d ' "\r' || true)
    echo "${val:-$default_val}"
}

DB_PORT=$(read_env_var "POSTGRES_PORT" "5432")
CATALOG_PORT=$(read_env_var "CATALOG_SERVICE_PORT" "8081")
CUSTOMER_PORT=$(read_env_var "CUSTOMER_SERVICE_PORT" "8082")
SALES_PORT=$(read_env_var "SALES_SERVICE_PORT" "8083")
LOAN_PORT=$(read_env_var "LOAN_SERVICE_PORT" "8085")

# verificacao de conectividade com o postgresql
if ! (echo > /dev/tcp/localhost/"$DB_PORT") 2>/dev/null; then
    echo -e "${YELLOW}[!] Aviso: Nao foi detectada conexao com o PostgreSQL na porta ${DB_PORT}.${NC}"
    echo -e "${YELLOW}    Certifique-se de que o banco de dados esteja ativo antes de iniciar os servicos.${NC}\n"
fi

# verificacao opcional do rabbitmq para mensageria assincrona
ensure_rabbitmq() {
    if (echo > /dev/tcp/localhost/5672) 2>/dev/null; then
        echo -e "${GREEN}[OK] RabbitMQ detectado na porta 5672.${NC}"
        return 0
    fi

    if command -v docker &>/dev/null && docker info &>/dev/null && [ -f "docker-compose.yml" ]; then
        echo -e "${YELLOW}[!] RabbitMQ nao detectado na porta 5672. Iniciando container 'rabbitmq' via Docker Compose...${NC}"
        if docker compose up -d rabbitmq >/dev/null 2>&1; then
            local elapsed=0
            while [ $elapsed -lt 30 ]; do
                if (echo > /dev/tcp/localhost/5672) 2>/dev/null; then
                    echo -e "${GREEN}[OK] RabbitMQ ativo na porta 5672.${NC}"
                    return 0
                fi
                sleep 1
                elapsed=$((elapsed + 1))
            done
        fi
    fi

    echo -e "${YELLOW}[!] Aviso: RabbitMQ nao detectado na porta 5672 (eventos ficarao em standby; emprestimos usarao fallback sob demanda).${NC}\n"
}

# verificacao de portas ocupadas
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
        check_port "$CATALOG_PORT" || exit 1
        ;;
    customer)
        check_port "$CUSTOMER_PORT" || exit 1
        ;;
    sales)
        check_port "$SALES_PORT" || exit 1
        ;;
    loan)
        check_port "$LOAN_PORT" || exit 1
        ;;
    all|"")
        check_port "$CATALOG_PORT" || exit 1
        check_port "$CUSTOMER_PORT" || exit 1
        check_port "$SALES_PORT" || exit 1
        check_port "$LOAN_PORT" || exit 1
        ;;
    *)
        echo -e "${RED}[X] Servico invalido: ${TARGET_SERVICE}${NC}"
        echo -e "Uso: $0 [all|catalog|customer|sales|loan]"
        exit 1
        ;;
esac

ensure_rabbitmq

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
    for port in "$CATALOG_PORT" "$CUSTOMER_PORT" "$SALES_PORT" "$LOAN_PORT"; do
        fuser -k -9 "${port}/tcp" 2>/dev/null || true
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
        if [ -n "$pid" ] && ! kill -0 "$pid" 2>/dev/null; then
            echo -e "\r${RED}[X] ${name} falhou ao iniciar (processo encerrou).${NC}"
            tail -n 20 "$log_file" 2>/dev/null || true
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

PID_CATALOG=""
PID_CUSTOMER=""
PID_SALES=""
PID_LOAN=""

start_catalog() {
    echo -e "${CYAN}-> Iniciando catalog-service na porta ${CATALOG_PORT} (logs em logs/catalog-service.log)...${NC}"
    mvn spring-boot:run -f backend/pom.xml -pl catalog-service > logs/catalog-service.log 2>&1 &
    PID_CATALOG=$!
    PIDS+=("$PID_CATALOG")
}

start_customer() {
    echo -e "${CYAN}-> Iniciando customer-service na porta ${CUSTOMER_PORT} (logs em logs/customer-service.log)...${NC}"
    mvn spring-boot:run -f backend/pom.xml -pl customer-service > logs/customer-service.log 2>&1 &
    PID_CUSTOMER=$!
    PIDS+=("$PID_CUSTOMER")
}

start_sales() {
    echo -e "${CYAN}-> Iniciando sales-service na porta ${SALES_PORT} (logs em logs/sales-service.log)...${NC}"
    mvn spring-boot:run -f backend/pom.xml -pl sales-service > logs/sales-service.log 2>&1 &
    PID_SALES=$!
    PIDS+=("$PID_SALES")
}

start_loan() {
    echo -e "${CYAN}-> Iniciando loan-service na porta ${LOAN_PORT} (logs em logs/loan-service.log)...${NC}"
    mvn spring-boot:run -f backend/pom.xml -pl loan-service > logs/loan-service.log 2>&1 &
    PID_LOAN=$!
    PIDS+=("$PID_LOAN")
}

set +e

if [ "$TARGET_SERVICE" = "all" ] || [ -z "$TARGET_SERVICE" ]; then
    echo -e "${BLUE}[Fase 1/2] Iniciando servicos base: catalog-service e customer-service...${NC}"
    start_catalog
    start_customer

    wait_for_health "catalog-service" "$CATALOG_PORT" "$PID_CATALOG"
    wait_for_health "customer-service" "$CUSTOMER_PORT" "$PID_CUSTOMER"

    echo -e "\n${BLUE}[Fase 2/2] Iniciando servicos dependentes: sales-service e loan-service...${NC}"
    start_sales
    start_loan
    wait_for_health "sales-service" "$SALES_PORT" "$PID_SALES"
    wait_for_health "loan-service" "$LOAN_PORT" "$PID_LOAN"

elif [ "$TARGET_SERVICE" = "catalog" ]; then
    start_catalog
    wait_for_health "catalog-service" "$CATALOG_PORT" "$PID_CATALOG"

elif [ "$TARGET_SERVICE" = "customer" ]; then
    start_customer
    wait_for_health "customer-service" "$CUSTOMER_PORT" "$PID_CUSTOMER"

elif [ "$TARGET_SERVICE" = "sales" ]; then
    start_sales
    wait_for_health "sales-service" "$SALES_PORT" "$PID_SALES"

elif [ "$TARGET_SERVICE" = "loan" ]; then
    start_loan
    wait_for_health "loan-service" "$LOAN_PORT" "$PID_LOAN"
fi

echo -e "\n${GREEN}${BOLD}[BookStore] Microsservicos prontos:${NC}"
echo -e " • Catalog Service:  ${CYAN}http://localhost:${CATALOG_PORT}${NC} (Health: /actuator/health | GraphQL: /graphql)"
echo -e " • Customer Service: ${CYAN}http://localhost:${CUSTOMER_PORT}${NC} (Health: /actuator/health)"
echo -e " • Sales Service:    ${CYAN}http://localhost:${SALES_PORT}${NC} (Health: /actuator/health)"
echo -e " • Loan Service:     ${CYAN}http://localhost:${LOAN_PORT}${NC} (Health: /actuator/health)"
echo -e " • Logs salvos em:   logs/catalog-service.log, logs/customer-service.log, logs/sales-service.log, logs/loan-service.log"
echo -e " • Acompanhar logs:  ${YELLOW}tail -f logs/*.log${NC}"
echo -e "${YELLOW}Pressione Ctrl+C para encerrar todos os servicos.${NC}\n"

wait
