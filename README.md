# BookStore — Sistema de Gerenciamento de Livraria

Sistema distribuído baseado em microsserviços para gerenciamento acadêmico de livraria contendo:
- **Microsserviços Java 21 + Spring Boot 3.4**: Catálogo, Clientes e Vendas organizados em arquitetura em camadas (`controller`, `service`, `repository`, `model`, `dto`, `mapper` com MapStruct);
- **API GraphQL** própria integrada ao serviço de catálogo (`/graphql`);
- **API Gateway Nginx** para roteamento unificado de requisições;
- **PostgreSQL 16** para persistência relacional;
- **Frontends SPA**: React (porta 5173/5175) e Vue.js (porta 5174);
- **Integrações Externas**: Google Books API, ViaCEP, QR Server e Nager.Date;
- **Análise de Carga**: Scripts de teste com k6.

---

## Estrutura do Repositório

```text
BookStore/
├── backend/                  # Microsserviços Java e pom.xml pai
│   ├── catalog-service/      # Gestão de livros, estoque e GraphQL (porta 8081)
│   ├── customer-service/     # Gestão de clientes e consulta ViaCEP (porta 8082)
│   ├── sales-service/        # Orquestração e registro de vendas (porta 8083)
│   ├── Dockerfile.service    # Build multi-stage Docker para os serviços
│   └── pom.xml               # Parent POM com dependências e MapStruct
├── frontend/                 # Interfaces de usuário SPA
│   ├── frontend-react/       # Aplicação React + Vite (porta 5173 local / 5175 docker)
│   └── frontend-vue/         # Aplicação Vue.js + Vite (porta 5174)
├── gateway/                  # Configuração do Nginx reverse proxy
│   └── nginx.conf
├── performance/              # Testes de carga com k6
│   ├── bookstore-load-test.js
│   └── README.md
├── docker-compose.yml        # Orquestração completa dos contêineres
├── .env.example              # Modelo de variáveis de ambiente
└── README.md
```

---

## Configuração de Ambiente (.env)

Copie o arquivo de exemplo para criar suas variáveis locais:

```bash
cp .env.example .env
```

O arquivo contém as portas, credenciais do banco e URLs de comunicação entre os serviços.

---

## Opção 1: Executar com Docker Compose (Recomendado)

Inicia todos os serviços, banco de dados, gateway e frontends em contêineres integrados.

### Pré-requisitos
- Docker Engine e Docker Compose instalados;
- Portas livres: `5432` (ou porta mapeada), `5173`/`5175`, `5174` e `8080`.

### Execução
Na raiz do repositório:

```bash
docker compose up --build
```

### Acessos disponíveis
* **Frontend React**: http://localhost:5175
* **Frontend Vue**: http://localhost:5174
* **API Gateway Nginx**: http://localhost:8080
* **Catálogo REST**: http://localhost:8080/api/catalog/books
* **Clientes REST**: http://localhost:8080/api/customers
* **Vendas REST**: http://localhost:8080/api/sales
* **GraphQL**: http://localhost:8080/graphql
* **Health Check do Gateway**: http://localhost:8080/actuator/health

### Parar os serviços
```bash
docker compose down
```
Para apagar também os volumes de dados do PostgreSQL:
```bash
docker compose down -v
```

---

## Opção 2: Executar Localmente (Sem Docker)

Você pode executar o projeto diretamente na sua máquina hospedeira sem utilizar Docker.

### Pré-requisitos
- **Java JDK 21** instalado (`java -version`);
- **Apache Maven 3.9+** instalado (`mvn -version`);
- **Node.js 20+** e **npm** instalados (`node -v` e `npm -v`);
- **PostgreSQL 16** instalado e em execução localmente.

---

### Passo 1: Configurar o Banco de Dados PostgreSQL Local

Certifique-se de que o serviço do PostgreSQL está rodando na porta `5432` e crie a base de dados:

```sql
CREATE DATABASE bookstore;
CREATE USER bookstore WITH ENCRYPTED PASSWORD 'bookstore';
GRANT ALL PRIVILEGES ON DATABASE bookstore TO bookstore;
```

Caso seu PostgreSQL local use outro usuário ou senha, ajuste as variáveis de ambiente ou passe diretamente no comando de inicialização.

---

### Passo 2: Iniciar os Microsserviços do Backend

Abra terminais separados (ou execute em segundo plano) para cada um dos 3 microsserviços a partir da pasta `backend`:

#### Terminal 1 — Catálogo (`catalog-service` - porta 8081)
```bash
cd backend
mvn spring-boot:run -pl catalog-service
```

#### Terminal 2 — Clientes (`customer-service` - porta 8082)
```bash
cd backend
mvn spring-boot:run -pl customer-service
```

#### Terminal 3 — Vendas (`sales-service` - porta 8083)
```bash
cd backend
mvn spring-boot:run -pl sales-service
```

> [!TIP]
> Caso queira compilar os arquivos JAR executáveis de todos os módulos de uma vez:
> ```bash
> cd backend
> mvn clean package -DskipTests
> ```
> E executar cada serviço via Java:
> ```bash
> java -jar catalog-service/target/catalog-service-1.0.0.jar
> java -jar customer-service/target/customer-service-1.0.0.jar
> java -jar sales-service/target/sales-service-1.0.0.jar
> ```

---

### Passo 3: Iniciar as Aplicações Frontend

Os frontends utilizam Vite com proxy configurado automaticamente: em modo local (sem Docker), o Vite redireciona chamadas `/api/catalog` para a porta `8081`, `/api/customers` para `8082` e `/api/sales` para `8083` de forma transparente.

#### Terminal 4 — Frontend React (porta 5173)
```bash
cd frontend/frontend-react
npm install
npm run dev
```
Acesse: http://localhost:5173

#### Terminal 5 — Frontend Vue (porta 5174)
```bash
cd frontend/frontend-vue
npm install
npm run dev
```
Acesse: http://localhost:5174

---

## Testar GraphQL
Envie uma requisição `POST` para `http://localhost:8080/graphql` (com Docker) ou `http://localhost:8081/graphql` (sem Docker):

### Listar livros:
```json
{"query":"{ books { id title authors price stock } }"}
```

### Criar livro:
```json
{"query":"mutation { createBook(title: \"Clean Code\", authors: \"Robert C. Martin\", price: 120.0, stock: 8) { id title } }"}
```

---

## Testar APIs Externas e Rotas REST

* **Google Books API**:
  `GET http://localhost:8080/api/integrations/google-books?q=java`
* **ViaCEP (Busca de Endereço)**:
  `GET http://localhost:8080/api/customers/cep/66053000`
* **Geração de QR Code**:
  `GET http://localhost:8080/api/catalog/books/1/qr`
* **Nager.Date (Feriados Nacionais)**:
  A interface Vue consulta diretamente `https://date.nager.at/api/v3/PublicHolidays/{ano}/BR`.

---

## Fluxo de Criação de Cliente e Venda

1. **Criar cliente**:
```bash
curl -X POST http://localhost:8080/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"Cliente Exemplo","email":"cliente@example.com","cep":"66053000"}'
```

2. **Criar venda** (utilize IDs existentes de cliente e livro):
```bash
curl -X POST http://localhost:8080/api/sales \
  -H "Content-Type: application/json" \
  -d '{"customerId":1,"bookId":1,"quantity":1}'
```

---

## Análise de Desempenho (k6)
Consulte o guia detalhado em [`performance/README.md`](performance/README.md).

Para executar o teste de carga:
```bash
k6 run performance/bookstore-load-test.js
```
Ou apontando para outro endereço:
```bash
k6 run -e BASE_URL=http://localhost:8080 performance/bookstore-load-test.js
```
