package br.com.bookstore.customer.service;

import br.com.bookstore.customer.dto.AuthResponse;
import br.com.bookstore.customer.dto.LoginRequest;
import br.com.bookstore.customer.dto.RefreshTokenRequest;
import br.com.bookstore.customer.dto.RegisterRequest;
import br.com.bookstore.customer.model.User;
import br.com.bookstore.customer.repository.UserRepository;
import br.com.bookstore.customer.security.SystemUserDetails;
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

// servico responsavel pelas operacoes de cadastro, autenticacao e renovacao de tokens de operadores
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    // registra novo operador no sistema com senha criptografada e emite tokens
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("E-mail ja cadastrado no sistema");
        }

        String assignedRole = request.role() != null && !request.role().isBlank()
                ? request.role()
                : SecurityRoles.ROLE_SELLER;

        if (!assignedRole.startsWith("ROLE_")) {
            assignedRole = "ROLE_" + assignedRole;
        }

        User user = new User(
                request.name(),
                request.email(),
                passwordEncoder.encode(request.password()),
                assignedRole
        );

        User saved = userRepository.save(user);
        SystemUserDetails userDetails = new SystemUserDetails(saved);

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

    // autentica operador via gerenciador de autenticacao e gera tokens de sessao
    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        SystemUserDetails userDetails = (SystemUserDetails) auth.getPrincipal();
        User user = userDetails.getUser();

        Map<String, Object> claims = buildClaims(user);

        String accessToken = jwtService.generateToken(user.getEmail(), userDetails.getAuthorities(), claims);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return new AuthResponse(
                accessToken,
                refreshToken,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isMustChangePassword()
        );
    }

    // valida token de atualizacao e emite novo token de acesso
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
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario associado ao token nao encontrado"));

        SystemUserDetails userDetails = new SystemUserDetails(user);

        Map<String, Object> claims = buildClaims(user);

        String newAccessToken = jwtService.generateToken(user.getEmail(), userDetails.getAuthorities(), claims);

        return new AuthResponse(
                newAccessToken,
                refreshToken,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isMustChangePassword()
        );
    }

    // altera a senha do operador e remove a exigencia de troca no primeiro acesso
    @Transactional
    public AuthResponse changePassword(String emailOrNull, br.com.bookstore.customer.dto.ChangePasswordRequest request) {
        String email = emailOrNull != null && !emailOrNull.isBlank() ? emailOrNull : request.email();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Identificacao do usuario ausente");
        }

        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Senha atual informada esta incorreta");
        }

        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new IllegalArgumentException("A nova senha nao pode ser igual a senha anterior");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        SystemUserDetails userDetails = new SystemUserDetails(user);
        Map<String, Object> claims = buildClaims(user);
        String accessToken = jwtService.generateToken(user.getEmail(), userDetails.getAuthorities(), claims);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return new AuthResponse(
                accessToken,
                refreshToken,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                false
        );
    }

    // constroi claims adicionais de forma segura contra valores nulos
    private Map<String, Object> buildClaims(User user) {
        Map<String, Object> claims = new HashMap<>();
        if (user.getId() != null) {
            claims.put("userId", user.getId());
        }
        if (user.getName() != null) {
            claims.put("name", user.getName());
        }
        return claims;
    }
}
