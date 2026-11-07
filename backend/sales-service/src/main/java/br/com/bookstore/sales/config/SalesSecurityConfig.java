package br.com.bookstore.sales.config;

import br.com.bookstore.security.config.SecurityConfigTemplate;
import br.com.bookstore.security.constant.SecurityRoles;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

// configuracao de seguranca para o microsservico de operacoes de vendas
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SalesSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityConfigTemplate template) throws Exception {
        return template.build(http, auth -> auth
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/sales").hasAnyRole(SecurityRoles.CUSTOMER, SecurityRoles.ADMIN)
                .requestMatchers(HttpMethod.GET, "/api/sales/**").authenticated()
                .anyRequest().authenticated()
        );
    }
}
