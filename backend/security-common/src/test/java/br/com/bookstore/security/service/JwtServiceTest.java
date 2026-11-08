package br.com.bookstore.security.service;

import br.com.bookstore.security.config.SecurityProperties;
import br.com.bookstore.security.constant.SecurityRoles;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private SecurityProperties properties;

    @BeforeEach
    void setUp() {
        properties = new SecurityProperties();
        properties.setSecret("test-secret-key-with-minimum-256-bits-length-for-hmac-sha-256-algorithm!");
        properties.setExpiration(3600000L); // 1 hora
        properties.setRefreshExpiration(86400000L); // 24 horas
        jwtService = new JwtService(properties);
    }

    @Test
    @DisplayName("deve gerar e validar token jwt com sucesso extraindo username e roles")
    void shouldGenerateAndValidateTokenSuccessfully() {
        String username = "usuario@bookstore.com";
        List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority(SecurityRoles.ROLE_CUSTOMER)
        );

        String token = jwtService.generateToken(username, authorities, Map.of("customerId", 1L));

        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token));
        assertTrue(jwtService.isTokenValid(token, username));
        assertEquals(username, jwtService.extractUsername(token));

        List<String> roles = jwtService.extractRoles(token);
        assertEquals(1, roles.size());
        assertEquals(SecurityRoles.ROLE_CUSTOMER, roles.getFirst());
    }

    @Test
    @DisplayName("deve invalidar token quando usuario esperado for diferente")
    void shouldInvalidateTokenWhenUsernameDiffers() {
        String token = jwtService.generateToken("user1@bookstore.com", Map.of());

        assertFalse(jwtService.isTokenValid(token, "outro@bookstore.com"));
    }

    @Test
    @DisplayName("deve gerar refresh token valido")
    void shouldGenerateValidRefreshToken() {
        String username = "usuario@bookstore.com";
        String refreshToken = jwtService.generateRefreshToken(username);

        assertNotNull(refreshToken);
        assertTrue(jwtService.isTokenValid(refreshToken, username));
        assertEquals("REFRESH", jwtService.extractClaim(refreshToken, claims -> claims.get("type")));
    }

    @Test
    @DisplayName("deve retornar falso ao validar token malformado ou corrompido")
    void shouldReturnFalseForMalformedToken() {
        assertFalse(jwtService.isTokenValid("token-invalido-malformado"));
    }
}
