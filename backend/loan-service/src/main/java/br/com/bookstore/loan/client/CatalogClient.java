package br.com.bookstore.loan.client;

import br.com.bookstore.loan.client.dto.CatalogBookResponse;
import br.com.bookstore.loan.exception.ExternalServiceException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class CatalogClient {

    private final RestClient catalogRestClient;

    public CatalogClient(@Qualifier("catalogRestClient") RestClient catalogRestClient) {
        this.catalogRestClient = catalogRestClient;
    }

    public CatalogBookResponse getBookById(Long bookId) {
        CatalogBookResponse book = ServiceClientHelper.getRequiredResource(
                catalogRestClient,
                "/api/catalog/books/{id}",
                bookId,
                CatalogBookResponse.class,
                "Book",
                "catalog-service"
        );
        if (book.id() == null) {
            throw new ExternalServiceException("Catalog returned an invalid book response");
        }
        return book;
    }

    public void validateBookExists(Long bookId) {
        getBookById(bookId);
    }
}
