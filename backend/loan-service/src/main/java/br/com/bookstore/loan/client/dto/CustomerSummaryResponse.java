package br.com.bookstore.loan.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CustomerSummaryResponse(
        Long id,
        String name,
        String email
) {
}
