package br.com.bookstore.customer.controller;

import br.com.bookstore.customer.dto.UserRequest;
import br.com.bookstore.customer.dto.UserResponse;
import br.com.bookstore.customer.dto.UserUpdateRequest;
import br.com.bookstore.customer.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// controlador rest para administracao de operadores do sistema (usuarios)
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    // lista todos os operadores cadastrados
    @GetMapping
    public List<UserResponse> all() {
        return service.findAll();
    }

    // busca operador especifico por identificador
    @GetMapping("/{id}")
    public UserResponse one(@PathVariable Long id) {
        return service.findById(id);
    }

    // cadastra novo operador do sistema
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody UserRequest request) {
        return service.create(request);
    }

    // altera dados cadastrais de um operador existente
    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
        return service.update(id, request);
    }

    // remove operador do sistema por identificador
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
