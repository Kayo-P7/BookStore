package br.com.bookstore.customer.service;

import br.com.bookstore.customer.dto.CustomerRequest;
import br.com.bookstore.customer.dto.CustomerResponse;
import br.com.bookstore.customer.mapper.CustomerMapper;
import br.com.bookstore.customer.model.Customer;
import br.com.bookstore.customer.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

// servico de regras de negocio para operacoes de clientes
@Service
public class CustomerService {

    private final CustomerRepository repo;
    private final CustomerMapper mapper;
    private final RestClient viaCep = RestClient.create("https://viacep.com.br");

    public CustomerService(CustomerRepository repo, CustomerMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    // retorna todos os clientes cadastrados em formato de resposta
    public List<CustomerResponse> findAll() {
        return mapper.toResponseList(repo.findAll());
    }

    // busca cliente por identificador e converte para dto
    public CustomerResponse findById(Long id) {
        return mapper.toResponse(findEntityById(id));
    }

    // cadastra novo cliente a partir dos dados recebidos
    @Transactional
    public CustomerResponse save(CustomerRequest request) {
        Customer customer = mapper.toEntity(request);
        return mapper.toResponse(repo.save(customer));
    }

    // atualiza cliente existente preservando seu identificador
    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = findEntityById(id);
        mapper.updateEntityFromRequest(request, customer);
        return mapper.toResponse(repo.save(customer));
    }

    // remove cliente pelo identificador informado
    @Transactional
    public void delete(Long id) {
        repo.delete(findEntityById(id));
    }

    // consulta endereco pelo cep utilizando servico externo viacep
    public Map findCep(String cep) {
        return viaCep.get()
                .uri("/ws/{cep}/json/", cep)
                .retrieve()
                .body(Map.class);
    }

    // busca a entidade no banco de dados lancando excecao caso nao exista
    public Customer findEntityById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado"));
    }
}
