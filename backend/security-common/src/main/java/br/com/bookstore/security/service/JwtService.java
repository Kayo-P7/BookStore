package br.com.bookstore.security.service;

import br.com.bookstore.security.config.SecurityProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.function.Function;

// servico centralizado para emissao leitura e validacao de tokens jwt
@Service
public class JwtService {

    private final SecurityProperties properties;

    public JwtService(SecurityProperties properties) {
        this.properties = properties;
    }

    // gera chave secreta a partir das propriedades com preenchimento seguro de 256 bits
    private SecretKey getSigningKey() {
        byte[] keyBytes = properties.getSecret().getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            keyBytes = Arrays.copyOf(keyBytes, 32);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // extrai o identificador ou username armazenado no subject do token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // extrai claim generico aplicando a funcao fornecida
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // extrai a lista de papeis do claim roles
    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Claims claims = extractAllClaims(token);
        Object rolesObj = claims.get("roles");
        if (rolesObj instanceof List<?> list) {
            return list.stream().map(Object::toString).toList();
        }
        return List.of();
    }

    // faz o parse e validacao criptografica da assinatura do token
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // gera token de acesso padrao com dados adicionais
    public String generateToken(String username, Map<String, Object> extraClaims) {
        return buildToken(username, extraClaims != null ? extraClaims : Map.of(), properties.getExpiration());
    }

    // gera token de acesso incluindo colecao de autoridades concedidas
    public String generateToken(String username,
                                Collection<? extends GrantedAuthority> authorities,
                                Map<String, Object> extraClaims) {
        Map<String, Object> claims = new HashMap<>();
        if (extraClaims != null) {
            claims.putAll(extraClaims);
        }
        if (authorities != null) {
            List<String> roles = authorities.stream()
                    .map(GrantedAuthority::getAuthority)
                    .toList();
            claims.put("roles", roles);
        }
        return buildToken(username, claims, properties.getExpiration());
    }

    // gera refresh token com tempo de vida estendido
    public String generateRefreshToken(String username) {
        return buildToken(username, Map.of("type", "REFRESH"), properties.getRefreshExpiration());
    }

    // constroi o payload do jwt e assina com hmac sha256
    private String buildToken(String username, Map<String, Object> claims, long expirationMs) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(now))
                .expiration(new Date(now + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    // verifica se o token possui assinatura valida e nao esta expirado
    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration() != null && !claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // valida token confrontando com o usuario esperado
    public boolean isTokenValid(String token, String expectedUsername) {
        try {
            String username = extractUsername(token);
            return username != null && username.equals(expectedUsername) && isTokenValid(token);
        } catch (Exception e) {
            return false;
        }
    }
}
