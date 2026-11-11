package br.com.bookstore.loan.client;

import br.com.bookstore.loan.client.dto.CustomerSummaryResponse;
import br.com.bookstore.loan.exception.ExternalServiceException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class CustomerClient {

    private final RestClient customerRestClient;

    public CustomerClient(@Qualifier("customerRestClient") RestClient customerRestClient) {
        this.customerRestClient = customerRestClient;
    }

    public CustomerSummaryResponse getCustomerById(Long customerId) {
        CustomerSummaryResponse customer = ServiceClientHelper.getRequiredResource(
                customerRestClient,
                "/api/customers/{id}",
                customerId,
                CustomerSummaryResponse.class,
                "Customer",
                "customer-service"
        );
        if (customer.id() == null) {
            throw new ExternalServiceException("Customer service returned an invalid customer response");
        }
        return customer;
    }

    public void validateCustomerExists(Long customerId) {
        getCustomerById(customerId);
    }
}
