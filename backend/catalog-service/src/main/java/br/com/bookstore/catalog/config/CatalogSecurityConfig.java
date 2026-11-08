package br.com.bookstore.catalog.config;

import br.com.bookstore.security.config.SecurityConfigTemplate;
import br.com.bookstore.security.constant.SecurityRoles;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

// configuracao de seguranca para o microsservico de catalogo de livros
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class CatalogSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityConfigTemplate template) throws Exception {
        return template.build(http, auth -> auth
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/graphql/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/catalog/books", "/api/catalog/books/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/integrations/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/catalog/books/*/decrease-stock").hasAnyRole(SecurityRoles.SELLER, SecurityRoles.ADMIN)
                .requestMatchers(HttpMethod.POST, "/api/catalog/books", "/api/catalog/books/**").hasRole(SecurityRoles.ADMIN)
                .requestMatchers(HttpMethod.PUT, "/api/catalog/books/**").hasRole(SecurityRoles.ADMIN)
                .requestMatchers(HttpMethod.DELETE, "/api/catalog/books/**").hasRole(SecurityRoles.ADMIN)
                .anyRequest().authenticated()
        );
    }
}
