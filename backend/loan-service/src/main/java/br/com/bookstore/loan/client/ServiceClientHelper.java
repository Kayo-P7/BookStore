package br.com.bookstore.loan.client;

import br.com.bookstore.loan.exception.ExternalServiceException;
import br.com.bookstore.loan.exception.ResourceNotFoundException;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

// utilitario compartilhado para consultas http entre microsservicos com mapeamento uniforme de falhas
final class ServiceClientHelper {

    private ServiceClientHelper() {
    }

    static <T> T getRequiredResource(
            RestClient client,
            String uri,
            Long resourceId,
            Class<T> responseType,
            String resourceName,
            String serviceName
    ) {
        try {
            T body = client.get()
                    .uri(uri, resourceId)
                    .retrieve()
                    .body(responseType);

            if (body == null) {
                throw new ExternalServiceException(serviceName + " returned an empty response");
            }
            return body;
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException(resourceName + " not found: " + resourceId);
        } catch (RestClientException ex) {
            throw new ExternalServiceException("Failed to communicate with " + serviceName + ": " + ex.getMessage(), ex);
        }
    }
}
