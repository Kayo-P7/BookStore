package br.com.bookstore.loan.config;

import br.com.bookstore.security.interceptor.SecurityTokenRelayInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

// configuracao dos clientes http para integracao com catalogo e clientes com propagacao jwt
@Configuration
public class RestClientConfig {

    @Bean
    public RestClient catalogRestClient(
            RestClient.Builder builder,
            SecurityTokenRelayInterceptor relayInterceptor,
            @Value("${services.catalog.base-url}") String catalogUrl
    ) {
        return builder
                .baseUrl(catalogUrl)
                .requestInterceptor(relayInterceptor)
                .build();
    }

    @Bean
    public RestClient customerRestClient(
            RestClient.Builder builder,
            SecurityTokenRelayInterceptor relayInterceptor,
            @Value("${services.customer.base-url}") String customerUrl
    ) {
        return builder
                .baseUrl(customerUrl)
                .requestInterceptor(relayInterceptor)
                .build();
    }
}
