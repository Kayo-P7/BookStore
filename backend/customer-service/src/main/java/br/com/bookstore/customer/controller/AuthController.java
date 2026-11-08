package br.com.bookstore.customer.controller;

import br.com.bookstore.customer.dto.AuthResponse;
import br.com.bookstore.customer.dto.LoginRequest;
import br.com.bookstore.customer.dto.RefreshTokenRequest;
import br.com.bookstore.customer.dto.RegisterRequest;
import br.com.bookstore.customer.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

// controlador rest para exposicao de rotas de autenticacao e registro
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // registra novo usuario cliente no sistema
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    // autentica credenciais de usuario e retorna tokens jwt
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    // renova o token de acesso utilizando o refresh token valido
    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request);
    }
}
