package br.com.bookstore.customer.service;

import br.com.bookstore.customer.dto.AuthResponse;
import br.com.bookstore.customer.dto.LoginRequest;
import br.com.bookstore.customer.dto.RefreshTokenRequest;
import br.com.bookstore.customer.dto.RegisterRequest;
import br.com.bookstore.customer.model.Customer;
import br.com.bookstore.customer.repository.CustomerRepository;
import br.com.bookstore.customer.security.CustomerUserDetails;
import br.com.bookstore.security.constant.SecurityRoles;
import br.com.bookstore.security.service.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

// servico responsavel pelas operacoes de cadastro, autenticacao e renovacao de tokens
@Service
public class AuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(CustomerRepository customerRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    // registra novo cliente no sistema com senha criptografada e emite tokens
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (customerRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("E-mail ja cadastrado no sistema");
        }

        Customer customer = new Customer();
        customer.setName(request.name());
        customer.setEmail(request.email());
        customer.setPassword(passwordEncoder.encode(request.password()));
        customer.setRole(SecurityRoles.ROLE_CUSTOMER);
        customer.setPhone(request.phone());
        customer.setCep(request.cep());
        customer.setStreet(request.street());
        customer.setNeighborhood(request.neighborhood());
        customer.setCity(request.city());
        customer.setState(request.state());

        Customer saved = customerRepository.save(customer);
        CustomerUserDetails userDetails = new CustomerUserDetails(saved);

        Map<String, Object> claims = buildClaims(saved);

        String accessToken = jwtService.generateToken(saved.getEmail(), userDetails.getAuthorities(), claims);
        String refreshToken = jwtService.generateRefreshToken(saved.getEmail());

        return new AuthResponse(
                accessToken,
                refreshToken,
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getRole()
        );
    }

    // autentica usuario via gerenciador de autenticacao e gera tokens de sessao
    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        CustomerUserDetails userDetails = (CustomerUserDetails) auth.getPrincipal();
        Customer customer = userDetails.getCustomer();

        Map<String, Object> claims = buildClaims(customer);

        String accessToken = jwtService.generateToken(customer.getEmail(), userDetails.getAuthorities(), claims);
        String refreshToken = jwtService.generateRefreshToken(customer.getEmail());

        return new AuthResponse(
                accessToken,
                refreshToken,
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getRole()
        );
    }

    // valida token de atualizacao e emite novo token de acesso preservando o refresh
    public AuthResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.refreshToken();
        if (!jwtService.isTokenValid(refreshToken)) {
            throw new IllegalArgumentException("Refresh token invalido ou expirado");
        }

        String tokenType = jwtService.extractClaim(refreshToken, claims -> claims.get("type", String.class));
        if (!"REFRESH".equals(tokenType)) {
            throw new IllegalArgumentException("Token fornecido nao e um refresh token");
        }

        String email = jwtService.extractUsername(refreshToken);
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario associado ao token nao encontrado"));

        CustomerUserDetails userDetails = new CustomerUserDetails(customer);

        Map<String, Object> claims = buildClaims(customer);

        String newAccessToken = jwtService.generateToken(customer.getEmail(), userDetails.getAuthorities(), claims);

        return new AuthResponse(
                newAccessToken,
                refreshToken,
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getRole()
        );
    }

    // constroi claims adicionais de forma segura contra valores nulos
    private Map<String, Object> buildClaims(Customer customer) {
        Map<String, Object> claims = new HashMap<>();
        if (customer.getId() != null) {
            claims.put("customerId", customer.getId());
        }
        if (customer.getName() != null) {
            claims.put("name", customer.getName());
        }
        return claims;
    }
}
