package br.com.bookstore.customer.controller;

import br.com.bookstore.customer.dto.CustomerRequest;
import br.com.bookstore.customer.dto.CustomerResponse;
import br.com.bookstore.customer.service.CustomerService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// controlador rest para exposicao de operacoes sobre clientes
@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService service;

    public CustomerController(CustomerService service) {
        this.service = service;
    }

    // lista clientes cadastrados com suporte opcional a paginacao
    @GetMapping
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public List<CustomerResponse> all(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            HttpServletResponse response
    ) {
        if (page == null && size == null) {
            return service.findAll();
        }
        Page<CustomerResponse> result = service.findPage(
                PageRequest.of(Math.max(page != null ? page : 0, 0), Math.clamp(size != null ? size : 20, 1, 200), Sort.by("id").descending())
        );
        response.setHeader("X-Total-Count", String.valueOf(result.getTotalElements()));
        return result.getContent();
    }

    @GetMapping("/paged")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public Page<CustomerResponse> paged(@PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return service.findPage(pageable);
    }

    // busca dados de um cliente especifico por id
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public CustomerResponse one(@PathVariable Long id) {
        return service.findById(id);
    }

    // cria novo registro de cliente
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public CustomerResponse create(@Valid @RequestBody CustomerRequest request) {
        return service.save(request);
    }

    // altera dados de um cliente existente
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public CustomerResponse update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        return service.update(id, request);
    }

    // exclui registro de cliente por id (exclusivo para administrador)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // consulta endereco completo a partir do cep
    @GetMapping("/cep/{cep}")
    public Map cep(@PathVariable String cep) {
        return service.findCep(cep);
    }
}
