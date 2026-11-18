package br.com.bookstore.customer.service;

import br.com.bookstore.customer.dto.CustomerRequest;
import br.com.bookstore.customer.dto.CustomerResponse;
import br.com.bookstore.customer.mapper.CustomerMapper;
import br.com.bookstore.customer.model.Customer;
import br.com.bookstore.customer.repository.CustomerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// servico de regras de negocio para operacoes de clientes
@Service
public class CustomerService {

    private static final int MAX_CEP_CACHE = 512;
    private static final long CEP_CACHE_TTL_MS = Duration.ofHours(24).toMillis();

    private record CepCacheEntry(Map<?, ?> value, long expiresAt) {}

    private final CustomerRepository repo;
    private final CustomerMapper mapper;
    // shortcut: cache local de ate 512 ceps por instancia, migrar para redis se escalar multiplas replicas
    private final ConcurrentHashMap<String, CepCacheEntry> cepCache = new ConcurrentHashMap<>();
    private final RestClient viaCep = buildViaCepClient();

    public CustomerService(CustomerRepository repo, CustomerMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    private static RestClient buildViaCepClient() {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(2))
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofSeconds(4));
        return RestClient.builder()
                .baseUrl("https://viacep.com.br")
                .requestFactory(factory)
                .build();
    }

    // retorna todos os clientes cadastrados em formato de resposta
    @Transactional(readOnly = true)
    public List<CustomerResponse> findAll() {
        return mapper.toResponseList(repo.findAll());
    }

    // retorna pagina de clientes sob demanda
    @Transactional(readOnly = true)
    public Page<CustomerResponse> findPage(Pageable pageable) {
        return repo.findAll(pageable).map(mapper::toResponse);
    }

    // busca cliente por identificador e converte para dto
    @Transactional(readOnly = true)
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

    // consulta endereco pelo cep utilizando servico externo viacep com cache em memoria
    public Map findCep(String cep) {
        String cleanCep = cep != null ? cep.replaceAll("\\D", "") : "";
        long now = System.currentTimeMillis();
        if (cleanCep.length() == 8) {
            CepCacheEntry cached = cepCache.get(cleanCep);
            if (cached != null && cached.expiresAt() > now) {
                return cached.value();
            }
        }

        Map response = viaCep.get()
                .uri("/ws/{cep}/json/", cleanCep.isEmpty() ? cep : cleanCep)
                .retrieve()
                .body(Map.class);

        if (cleanCep.length() == 8 && response != null && !Boolean.TRUE.equals(response.get("erro"))) {
            if (cepCache.size() >= MAX_CEP_CACHE) {
                cepCache.entrySet().removeIf(e -> e.getValue().expiresAt() <= now);
                if (cepCache.size() >= MAX_CEP_CACHE) {
                    cepCache.clear();
                }
            }
            cepCache.put(cleanCep, new CepCacheEntry(response, now + CEP_CACHE_TTL_MS));
        }
        return response;
    }

    // busca a entidade no banco de dados lancando excecao caso nao exista
    @Transactional(readOnly = true)
    public Customer findEntityById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado"));
    }
}
