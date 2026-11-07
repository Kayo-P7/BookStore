package br.com.bookstore.customer.controller;

import br.com.bookstore.customer.dto.CustomerRequest;
import br.com.bookstore.customer.dto.CustomerResponse;
import br.com.bookstore.customer.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService service;

    public CustomerController(CustomerService service) {
        this.service = service;
    }

    @GetMapping
    public List<CustomerResponse> all() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public CustomerResponse one(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public CustomerResponse create(@Valid @RequestBody CustomerRequest request) {
        return service.save(request);
    }

    @PutMapping("/{id}")
    public CustomerResponse update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/cep/{cep}")
    public Map cep(@PathVariable String cep) {
        return service.findCep(cep);
    }
}
