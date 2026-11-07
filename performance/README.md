# Análise de desempenho

Requer k6 instalado. Com o sistema iniciado, execute:

```bash
k6 run performance/bookstore-load-test.js
```

Para testar outro endereço:

```bash
k6 run -e BASE_URL=http://localhost:8080 performance/bookstore-load-test.js
```

O teste aumenta gradualmente até 50 usuários virtuais. Registre no relatório:
- total de requisições e requisições por segundo;
- duração média e percentis p90/p95;
- taxa de falhas;
- comportamento observado durante ramp-up e ramp-down.

Os limites configurados são metas iniciais de referência (p95 abaixo de 1 segundo e falhas abaixo de 5%), não resultados medidos. Execute mais de uma rodada e registre hardware, sistema operacional, versão do Docker e carga utilizada.
