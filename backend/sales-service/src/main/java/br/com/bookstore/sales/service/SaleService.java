package br.com.bookstore.sales.service;

import br.com.bookstore.sales.dto.SaleRequest;
import br.com.bookstore.sales.dto.SaleResponse;
import br.com.bookstore.sales.mapper.SaleMapper;
import br.com.bookstore.sales.model.Sale;
import br.com.bookstore.sales.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

// servico de regras de negocio para operacoes e orquestracao de vendas
@Service
public class SaleService {

    private final SaleRepository repo;
    private final SaleMapper mapper;
    private final RestClient catalog;
    private final RestClient customers;

    public SaleService(SaleRepository repo,
                       SaleMapper mapper,
                       @Value("${services.catalog-url}") String catalogUrl,
                       @Value("${services.customer-url}") String customerUrl) {
        this.repo = repo;
        this.mapper = mapper;
        this.catalog = RestClient.create(catalogUrl);
        this.customers = RestClient.create(customerUrl);
    }

    // retorna todas as vendas realizadas em formato de resposta
    public List<SaleResponse> findAll() {
        return mapper.toResponseList(repo.findAll());
    }

    // valida integracao com clientes, abate estoque e registra venda em chamada unica
    @Transactional
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

        Sale sale = new Sale(request.customerId(), request.bookId(), request.quantity(), price);
        return mapper.toResponse(repo.save(sale));
    }
}
