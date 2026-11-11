package br.com.bookstore.loan.client;

import br.com.bookstore.loan.client.dto.CatalogBookResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Component
public class CatalogClient {

    private final RestClient catalogRestClient;

    public CatalogClient(RestClient catalogRestClient) {
        this.catalogRestClient = catalogRestClient;
    }

    public void validateBookExists(Long bookId) {
        try {
            CatalogBookResponse book = catalogRestClient
                    .get()
                    .uri("/api/catalog/books/{id}", bookId)
                    .retrieve()
                    .body(CatalogBookResponse.class);

            if (book == null || book.id() == null) {
                throw new IllegalStateException(
                        "Catalog returned an invalid book response"
                );
            }

        } catch (HttpClientErrorException.NotFound exception) {
            throw new IllegalArgumentException(
                    "Book not found in catalog: " + bookId
            );
        }
    }
}