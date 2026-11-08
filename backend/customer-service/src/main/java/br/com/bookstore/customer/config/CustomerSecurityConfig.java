package br.com.bookstore.customer.config;

import br.com.bookstore.security.config.SecurityConfigTemplate;
import br.com.bookstore.security.constant.SecurityRoles;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

// configuracao de seguranca especifica do servico de clientes e autenticacao
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class CustomerSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityConfigTemplate template) throws Exception {
        return template.build(http, auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/customers/cep/**").permitAll()
                .requestMatchers("/api/users", "/api/users/**").hasRole(SecurityRoles.ADMIN)
                .requestMatchers(HttpMethod.POST, "/api/customers", "/api/customers/**").hasAnyRole(SecurityRoles.SELLER, SecurityRoles.ADMIN)
                .requestMatchers(HttpMethod.PUT, "/api/customers", "/api/customers/**").hasAnyRole(SecurityRoles.SELLER, SecurityRoles.ADMIN)
                .requestMatchers(HttpMethod.DELETE, "/api/customers", "/api/customers/**").hasRole(SecurityRoles.ADMIN)
                .requestMatchers("/api/customers", "/api/customers/**").hasAnyRole(SecurityRoles.SELLER, SecurityRoles.ADMIN)
                .anyRequest().authenticated()
        );
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
