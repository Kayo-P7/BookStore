package br.com.bookstore.sales.controller;

import br.com.bookstore.sales.dto.SaleRequest;
import br.com.bookstore.sales.dto.SaleResponse;
import br.com.bookstore.sales.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService service;

    public SaleController(SaleService service) {
        this.service = service;
    }

    @GetMapping
    public List<SaleResponse> all() {
        return service.findAll();
    }

    @PostMapping
    public SaleResponse create(@Valid @RequestBody SaleRequest request) {
        return service.create(request);
    }
}
