package br.com.bookstore.loan.config;

import br.com.bookstore.security.config.SecurityConfigTemplate;
import br.com.bookstore.security.constant.SecurityRoles;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

// configuracao de seguranca do microsservico de emprestimos
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class LoanSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            SecurityConfigTemplate template
    ) throws Exception {

        return template.build(http, auth -> auth
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/loans/inventory")
                .hasRole(SecurityRoles.ADMIN)
                .requestMatchers(HttpMethod.GET, "/api/loans", "/api/loans/**")
                .hasAnyRole(SecurityRoles.ADMIN, SecurityRoles.SELLER)
                .requestMatchers(HttpMethod.POST, "/api/loans")
                .hasAnyRole(SecurityRoles.ADMIN, SecurityRoles.SELLER)
                .requestMatchers(HttpMethod.PUT, "/api/loans/*/return")
                .hasAnyRole(SecurityRoles.ADMIN, SecurityRoles.SELLER)
                .anyRequest().authenticated()
        );
    }
}
