package br.com.bookstore.security.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

// propriedades configuraveis de seguranca e token jwt
@Component
@ConfigurationProperties(prefix = "bookstore.security.jwt")
public class SecurityProperties {

    // chave padrao de seguranca para desenvolvimento com no minimo 256 bits
    private String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private long expiration = 86400000L; // 24 horas em milissegundos
    private long refreshExpiration = 604800000L; // 7 dias em milissegundos

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
}
