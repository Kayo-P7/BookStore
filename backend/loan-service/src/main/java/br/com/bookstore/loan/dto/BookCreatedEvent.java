package br.com.bookstore.loan.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

// evento recebido do catalog-service quando um livro e cadastrado
@JsonIgnoreProperties(ignoreUnknown = true)
public record BookCreatedEvent(
        Long bookId,
        Integer stock
) {
}
