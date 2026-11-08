package br.com.bookstore.sales.controller;

import br.com.bookstore.sales.dto.SaleRequest;
import br.com.bookstore.sales.dto.SaleResponse;
import br.com.bookstore.sales.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// controlador rest para exposicao de operacoes sobre vendas
@RestController
@RequestMapping("/api/sales")
@PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
public class SaleController {

    private final SaleService service;

    public SaleController(SaleService service) {
        this.service = service;
    }

    // lista todas as vendas registradas
    @GetMapping
    public List<SaleResponse> all() {
        return service.findAll();
    }

    // registra nova operacao de venda
    @PostMapping
    public SaleResponse create(@Valid @RequestBody SaleRequest request) {
        return service.create(request);
    }
}
