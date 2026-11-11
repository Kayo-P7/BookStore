# Loan Service

Microserviço responsável pelo gerenciamento de empréstimos e devoluções de livros no sistema BookStore.

## Objetivo

O Loan Service amplia as funcionalidades do BookStore, permitindo controlar os empréstimos realizados pelos clientes e a disponibilidade de exemplares para empréstimo.

O serviço possui responsabilidade própria sobre o controle de empréstimos e seu respectivo inventário, sem depender diretamente das tabelas internas dos outros microsserviços.

## Tecnologias utilizadas

- Java 21
- Spring Boot
- Spring Data JPA
- PostgreSQL
- Spring AMQP
- RabbitMQ
- Maven

## Estrutura do projeto

```text
loan-service/
├── src/
│   ├── main/
│   │   ├── java/br/com/bookstore/loan/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── mapper/
│   │   │   ├── model/
│   │   │   ├── repository/
│   │   │   └── service/
│   │   └── resources/
│   └── test/
└── pom.xml
```

## Modelagem inicial

### Loan

Representa uma operação de empréstimo.

Principais atributos:

- `id`: identificador do empréstimo.
- `bookId`: identificador do livro no Catalog Service.
- `customerId`: identificador do cliente no Customer Service.
- `loanDate`: data de realização do empréstimo.
- `dueDate`: data prevista para devolução.
- `returnDate`: data efetiva da devolução.
- `status`: situação atual do empréstimo.

### BookLoanInventory

Controla a quantidade de exemplares disponíveis para empréstimo.

Principais atributos:

- `id`: identificador do registro.
- `bookId`: identificador do livro.
- `totalCopies`: quantidade total de exemplares.
- `availableCopies`: quantidade disponível.
- `borrowedCopies`: quantidade emprestada.

Cada livro possui um registro de inventário no Loan Service.

## Comunicação entre microsserviços

O projeto utiliza RabbitMQ para comunicação assíncrona baseada em eventos.

A escolha dessa tecnologia tem como objetivo reduzir o acoplamento entre os microsserviços e permitir que eventos sejam processados independentemente da execução direta de uma requisição HTTP.

### Por que RabbitMQ?

Quando um empréstimo é criado ou devolvido, o Loan Service poderá publicar eventos para que outros componentes interessados processem essas informações.

Os eventos previstos são:

- `LoanCreatedEvent`: publicado quando um empréstimo é realizado.
- `LoanReturnedEvent`: publicado quando um livro é devolvido.

Esses eventos poderão ser consumidos por outros componentes para registrar notificações e histórico de movimentações.

O RabbitMQ atua como intermediário nessa comunicação, utilizando exchanges e filas para encaminhar as mensagens aos consumidores.

### Fluxo planejado

```text
Loan Service
     |
     | Publica evento
     v
  RabbitMQ
     |
     | Encaminha mensagem
     v
  Consumer
     |
     v
Notificações / Histórico
```

A comunicação assíncrona permite que o serviço responsável pelo empréstimo não precise conhecer diretamente todos os consumidores dos eventos.

## Status do desenvolvimento

- [x] Criação da estrutura do Loan Service.
- [x] Configuração inicial do Maven.
- [x] Inclusão das dependências do Spring AMQP.
- [x] Criação das entidades Loan e BookLoanInventory.
- [x] Criação do enum LoanStatus.
- [x] Criação dos repositórios.
- [x] Configuração inicial do RabbitMQ no Docker Compose.
- [ ] Implementação das regras de empréstimo.
- [ ] Implementação das regras de devolução.
- [ ] Publicação dos eventos LoanCreatedEvent e LoanReturnedEvent.
- [ ] Implementação dos consumidores.
- [ ] Testes de integração.

