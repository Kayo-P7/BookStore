package br.com.bookstore.security.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.IOException;

// interceptor para propagar token bearer de autenticacao em chamadas http entre servicos
@Component
public class SecurityTokenRelayInterceptor implements ClientHttpRequestInterceptor {

    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution)
            throws IOException {
        // tenta obter o token a partir das credenciais no contexto de seguranca
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getCredentials() instanceof String token && !token.isBlank()) {
            request.getHeaders().set(HttpHeaders.AUTHORIZATION, BEARER_PREFIX + token);
            return execution.execute(request, body);
        }

        // fallback tentando obter o cabecalho authorization da requisicao http original
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes servletAttributes) {
            HttpServletRequest currentRequest = servletAttributes.getRequest();
            String currentAuth = currentRequest.getHeader(HttpHeaders.AUTHORIZATION);
            if (currentAuth != null && !currentAuth.isBlank()) {
                request.getHeaders().set(HttpHeaders.AUTHORIZATION, currentAuth);
            }
        }

        return execution.execute(request, body);
    }
}
