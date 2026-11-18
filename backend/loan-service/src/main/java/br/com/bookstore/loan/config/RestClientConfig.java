package br.com.bookstore.loan.config;

import br.com.bookstore.security.interceptor.SecurityTokenRelayInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

// configuracao dos clientes http para integracao com catalogo e clientes com propagacao jwt e timeouts
@Configuration
public class RestClientConfig {

    private static JdkClientHttpRequestFactory buildRequestFactory() {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(2))
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofSeconds(4));
        return factory;
    }

    @Bean
    public RestClient catalogRestClient(
            RestClient.Builder builder,
            SecurityTokenRelayInterceptor relayInterceptor,
            @Value("${services.catalog.base-url}") String catalogUrl
    ) {
        return builder
                .baseUrl(catalogUrl)
                .requestFactory(buildRequestFactory())
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
                .requestFactory(buildRequestFactory())
                .requestInterceptor(relayInterceptor)
                .build();
    }
}
