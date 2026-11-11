package br.com.bookstore.loan.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient catalogRestClient(
            RestClient.Builder builder,
            @Value("${services.catalog.base-url}") String catalogUrl
    ) {
        return builder
                .baseUrl(catalogUrl)
                .build();
    }
}