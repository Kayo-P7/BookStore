package br.com.bookstore.sales.controller;

import br.com.bookstore.sales.dto.SaleRequest;
import br.com.bookstore.sales.dto.SaleResponse;
import br.com.bookstore.sales.dto.SaleSummaryResponse;
import br.com.bookstore.sales.service.SaleService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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

    // lista vendas registradas com suporte opcional a paginacao
    @GetMapping
    public List<SaleResponse> all(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            HttpServletResponse response
    ) {
        if (page == null && size == null) {
            return service.findAll();
        }
        Page<SaleResponse> result = service.findPage(
                PageRequest.of(Math.max(page != null ? page : 0, 0), Math.clamp(size != null ? size : 20, 1, 200), Sort.by("id").descending())
        );
        response.setHeader("X-Total-Count", String.valueOf(result.getTotalElements()));
        return result.getContent();
    }

    @GetMapping("/paged")
    public Page<SaleResponse> paged(@PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return service.findPage(pageable);
    }

    // retorna metricas agregadas de vendas e ultimos 6 registros para a dashboard
    @GetMapping("/summary")
    public SaleSummaryResponse summary() {
        return service.getSummary();
    }

    // registra nova operacao de venda
    @PostMapping
    public SaleResponse create(@Valid @RequestBody SaleRequest request) {
        return service.create(request);
    }
}
