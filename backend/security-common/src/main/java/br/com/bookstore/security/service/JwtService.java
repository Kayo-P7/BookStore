package br.com.bookstore.security.service;

import br.com.bookstore.security.config.SecurityProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
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

    private record ParserCache(String rawSecret, SecretKey key, JwtParser parser) {}

    private final SecurityProperties properties;
    private volatile ParserCache cache;

    public JwtService(SecurityProperties properties) {
        this.properties = properties;
    }

    // reutiliza chave hmac e parser thread-safe evitando realocacao a cada requisicao
    private ParserCache parserCache() {
        String currentSecret = properties.getSecret();
        ParserCache local = this.cache;
        if (local != null && Objects.equals(local.rawSecret(), currentSecret)) {
            return local;
        }
        byte[] keyBytes = currentSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            keyBytes = Arrays.copyOf(keyBytes, 32);
        }
        SecretKey secretKey = Keys.hmacShaKeyFor(keyBytes);
        JwtParser parser = Jwts.parser().verifyWith(secretKey).build();
        ParserCache created = new ParserCache(currentSecret, secretKey, parser);
        this.cache = created;
        return created;
    }

    private SecretKey getSigningKey() {
        return parserCache().key();
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
    public List<String> extractRoles(String token) {
        return extractRoles(extractAllClaims(token));
    }

    // extrai papeis a partir de claims ja validados sem novo parse criptografico
    public List<String> extractRoles(Claims claims) {
        Object rolesObj = claims.get("roles");
        if (rolesObj instanceof List<?> list) {
            return list.stream().map(Object::toString).toList();
        }
        return List.of();
    }

    // faz o parse e validacao criptografica da assinatura do token
    public Claims extractAllClaims(String token) {
        return parserCache().parser()
                .parseSignedClaims(token)
                .getPayload();
    }

    // valida assinatura e expiracao em passe unico retornando os claims
    public Optional<Claims> parseValidClaims(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        try {
            Claims claims = extractAllClaims(token);
            if (claims.getExpiration() != null && !claims.getExpiration().before(new Date())) {
                return Optional.of(claims);
            }
            return Optional.empty();
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
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
        return parseValidClaims(token).isPresent();
    }

    // valida token confrontando com o usuario esperado em passe unico
    public boolean isTokenValid(String token, String expectedUsername) {
        return parseValidClaims(token)
                .map(Claims::getSubject)
                .filter(username -> username.equals(expectedUsername))
                .isPresent();
    }
}
