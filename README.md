# BookStore — projeto executável

Sistema acadêmico de gerenciamento de livraria com:
- Microsserviços Java + Spring Boot: catálogo, clientes e vendas;
- API GraphQL própria no serviço de catálogo (`/graphql`);
- API Gateway Nginx;
- PostgreSQL;
- Frontend React (porta 5173) e Vue.js (porta 5174);
- Integrações: Google Books, ViaCEP, QR Server e Nager.Date;
- Script de teste de carga com k6.

## Requisitos
- Docker Engine e Docker Compose;
- conexão com a internet na primeira execução (download das imagens e dependências);
- portas 5432, 5173, 5174 e 8080 livres.

## Executar
Na raiz do projeto:

```bash
docker compose up --build
```

A primeira compilação pode demorar alguns minutos.

Acesse:
- React: http://localhost:5173
- Vue: http://localhost:5174
- Gateway: http://localhost:8080
- Catálogo REST: http://localhost:8080/api/catalog/books
- GraphQL: http://localhost:8080/graphql
- Health do gateway: http://localhost:8080/actuator/health

## Testar GraphQL
Envie uma requisição POST para `http://localhost:8080/graphql` com:

```json
{"query":"{ books { id title authors price stock } }"}
```

Criar livro:

```json
{"query":"mutation { createBook(title: \"Clean Code\", authors: \"Robert C. Martin\", price: 120.0, stock: 8) { id title } }"}
```

## Testar APIs externas
- Google Books: `GET http://localhost:8080/api/integrations/google-books?q=java`
- ViaCEP: `GET http://localhost:8080/api/customers/cep/66053000`
- QR Code: `GET http://localhost:8080/api/catalog/books/1/qr`
- Nager.Date: a interface Vue consulta `https://date.nager.at/api/v3/PublicHolidays/{ano}/BR`.

## Criar cliente e venda
Criar cliente:
```bash
curl -X POST http://localhost:8080/api/customers -H "Content-Type: application/json" -d '{"name":"Cliente Exemplo","email":"cliente@example.com","cep":"66053000"}'
```

Criar venda (use IDs existentes):
```bash
curl -X POST http://localhost:8080/api/sales -H "Content-Type: application/json" -d '{"customerId":1,"bookId":1,"quantity":1}'
```

## Parar e remover dados
```bash
docker compose down
```
Para apagar também os dados do PostgreSQL:
```bash
docker compose down -v
```

## Análise de desempenho
Veja `performance/README.md`. Não apresente números estimados como resultados: execute o teste no ambiente da equipe e registre os dados reais.

## Observações técnicas
- Os três serviços compartilham a instância PostgreSQL neste protótipo acadêmico; cada serviço mantém suas próprias tabelas.
- O gateway é implementado com Nginx para manter o roteamento simples.
- O QR Code é gerado pelo serviço QR Server (`api.qrserver.com`), substituindo a referência anterior ao QRKit.
- A API GraphQL é própria e desenvolvida com Spring for GraphQL.
- O projeto é uma base acadêmica executável. Antes de uma apresentação formal, execute os fluxos, registre evidências e valide os requisitos com o professor.
