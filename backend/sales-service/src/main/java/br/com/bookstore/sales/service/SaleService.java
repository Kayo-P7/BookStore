package br.com.bookstore.sales.service;

import br.com.bookstore.sales.dto.SaleRequest;
import br.com.bookstore.sales.dto.SaleResponse;
import br.com.bookstore.sales.dto.SaleSummaryResponse;
import br.com.bookstore.sales.mapper.SaleMapper;
import br.com.bookstore.sales.model.Sale;
import br.com.bookstore.sales.repository.SaleRepository;
import br.com.bookstore.security.interceptor.SecurityTokenRelayInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionOperations;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;
import java.util.Map;

// servico de regras de negocio para operacoes e orquestracao de vendas
@Service
public class SaleService {

    private final SaleRepository repo;
    private final SaleMapper mapper;
    private final RestClient catalog;
    private final RestClient customers;
    private TransactionOperations transactionOperations = TransactionOperations.withoutTransaction();

    public SaleService(SaleRepository repo,
                       SaleMapper mapper,
                       SecurityTokenRelayInterceptor relayInterceptor,
                       @Value("${services.catalog-url}") String catalogUrl,
                       @Value("${services.customer-url}") String customerUrl) {
        this.repo = repo;
        this.mapper = mapper;
        JdkClientHttpRequestFactory requestFactory = buildRequestFactory();
        this.catalog = RestClient.builder()
                .baseUrl(catalogUrl)
                .requestFactory(requestFactory)
                .requestInterceptor(relayInterceptor)
                .build();
        this.customers = RestClient.builder()
                .baseUrl(customerUrl)
                .requestFactory(requestFactory)
                .requestInterceptor(relayInterceptor)
                .build();
    }

    @Autowired(required = false)
    void setTransactionOperations(TransactionOperations transactionOperations) {
        if (transactionOperations != null) {
            this.transactionOperations = transactionOperations;
        }
    }

    private static JdkClientHttpRequestFactory buildRequestFactory() {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(2))
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofSeconds(4));
        return factory;
    }

    // retorna todas as vendas realizadas em formato de resposta
    @Transactional(readOnly = true)
    public List<SaleResponse> findAll() {
        return mapper.toResponseList(repo.findAll());
    }

    // retorna pagina de vendas sob demanda
    @Transactional(readOnly = true)
    public Page<SaleResponse> findPage(Pageable pageable) {
        return repo.findAll(pageable).map(mapper::toResponse);
    }

    // consolida total de vendas, receita bruta e ultimos pedidos direto no banco
    @Transactional(readOnly = true)
    public SaleSummaryResponse getSummary() {
        long count = repo.count();
        BigDecimal revenue = repo.sumTotalRevenue();
        List<SaleResponse> recent = mapper.toResponseList(repo.findTop6ByOrderByIdDesc());
        return new SaleSummaryResponse(count, revenue != null ? revenue : BigDecimal.ZERO, recent);
    }

    // valida integracao e abate estoque fora da transacao de banco local evitando reter conexoes hikaricp
    public SaleResponse create(SaleRequest request) {
        if (request.quantity() == null || request.quantity() < 1) {
            throw new IllegalArgumentException("quantidade invalida");
        }
        customers.get()
                .uri("/api/customers/{id}", request.customerId())
                .retrieve()
                .toBodilessEntity();

        Map book = catalog.post()
                .uri("/api/catalog/books/{id}/decrease-stock?quantity={q}", request.bookId(), request.quantity())
                .retrieve()
                .body(Map.class);

        if (book == null || book.get("price") == null) {
            throw new IllegalStateException("livro nao encontrado ou sem preco informado");
        }

        BigDecimal price = new BigDecimal(book.get("price").toString());

        Sale saved = transactionOperations.execute(status ->
                repo.save(new Sale(request.customerId(), request.bookId(), request.quantity(), price))
        );
        return mapper.toResponse(saved);
    }
}
