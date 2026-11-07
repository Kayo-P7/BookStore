package br.com.bookstore.customer;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import jakarta.validation.Valid;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerRepository repo;
    private final RestClient viaCep = RestClient.create("https://viacep.com.br");

    public CustomerController(CustomerRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Customer> all() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Customer one(@PathVariable Long id) {
        return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado"));
    }

    @PostMapping
    public Customer create(@Valid @RequestBody Customer c) {
        return repo.save(c);
    }

    @PutMapping("/{id}")
    public Customer update(@PathVariable Long id, @Valid @RequestBody Customer c) {
        Customer old = one(id);
        old.setName(c.getName());
        old.setEmail(c.getEmail());
        old.setPhone(c.getPhone());
        old.setCep(c.getCep());
        old.setStreet(c.getStreet());
        old.setNeighborhood(c.getNeighborhood());
        old.setCity(c.getCity());
        old.setState(c.getState());
        return repo.save(old);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.delete(one(id));
    }

 @GetMapping("/cep/{cep}")
 public Map cep(@PathVariable String cep) {
  return viaCep.get()
          .uri("/ws/{cep}/json/", cep)
          .retrieve()
          .body(Map.class);
 }
}
