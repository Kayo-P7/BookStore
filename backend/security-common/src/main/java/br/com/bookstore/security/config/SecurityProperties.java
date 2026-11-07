package br.com.bookstore.security.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

// propriedades configuraveis de seguranca e token jwt
@Component
@ConfigurationProperties(prefix = "bookstore.security.jwt")
public class SecurityProperties {

    // chave padrao de seguranca com no minimo 256 bits com fallback para variavel jwt_secret
    @Value("${bookstore.security.jwt.secret:${JWT_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}}")
    private String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @Value("${bookstore.security.jwt.expiration:${JWT_EXPIRATION:86400000}}")
    private long expiration = 86400000L; // 24 horas em milissegundos

    @Value("${bookstore.security.jwt.refresh-expiration:${JWT_REFRESH_EXPIRATION:604800000}}")
    private long refreshExpiration = 604800000L; // 7 dias em milissegundos

    private List<String> allowedOrigins = List.of("*");

    public SecurityProperties() {
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getExpiration() {
        return expiration;
    }

    public void setExpiration(long expiration) {
        this.expiration = expiration;
    }

    public long getRefreshExpiration() {
        return refreshExpiration;
    }

    public void setRefreshExpiration(long refreshExpiration) {
        this.refreshExpiration = refreshExpiration;
    }

    public List<String> getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }
}
