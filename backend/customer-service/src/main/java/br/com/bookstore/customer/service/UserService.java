package br.com.bookstore.customer.service;

import br.com.bookstore.customer.dto.UserRequest;
import br.com.bookstore.customer.dto.UserResponse;
import br.com.bookstore.customer.dto.UserUpdateRequest;
import br.com.bookstore.customer.mapper.UserMapper;
import br.com.bookstore.customer.model.User;
import br.com.bookstore.customer.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// servico de regras de negocio para administracao de operadores do sistema
@Service
public class UserService {

    private final UserRepository repo;
    private final UserMapper mapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repo, UserMapper mapper, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.mapper = mapper;
        this.passwordEncoder = passwordEncoder;
    }

    // lista todos os operadores cadastrados
    public List<UserResponse> findAll() {
        return mapper.toResponseList(repo.findAll());
    }

    // busca operador por identificador
    public UserResponse findById(Long id) {
        return mapper.toResponse(findEntityById(id));
    }

    // cadastra novo operador garantindo unicidade de e-mail e criptografia de senha
    @Transactional
    public UserResponse create(UserRequest request) {
        if (repo.existsByEmail(request.email())) {
            throw new IllegalArgumentException("E-mail ja cadastrado para outro usuario");
        }

        User user = mapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(normalizeRole(request.role()));

        return mapper.toResponse(repo.save(user));
    }

    // atualiza operador existente incluindo mudanca opcional de senha e status
    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = findEntityById(id);

        if (!user.getEmail().equalsIgnoreCase(request.email()) && repo.existsByEmail(request.email())) {
            throw new IllegalArgumentException("E-mail ja em uso por outro usuario");
        }

        user.setName(request.name());
        user.setEmail(request.email());
        user.setRole(normalizeRole(request.role()));

        if (request.active() != null) {
            user.setActive(request.active());
        }

        if (request.password() != null && !request.password().isBlank()) {
            if (request.password().length() < 6) {
                throw new IllegalArgumentException("A nova senha deve possuir no minimo 6 caracteres");
            }
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        return mapper.toResponse(repo.save(user));
    }

    // exclui operador pelo identificador informado
    @Transactional
    public void delete(Long id) {
        repo.delete(findEntityById(id));
    }

    // busca a entidade no banco de dados lancando excecao caso nao exista
    public User findEntityById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado com o id: " + id));
    }

    // normaliza role garantindo o prefixo ROLE_
    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "ROLE_SELLER";
        }
        return role.startsWith("ROLE_") ? role.toUpperCase() : "ROLE_" + role.toUpperCase();
    }
}
