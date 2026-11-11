package br.com.bookstore.catalog.dto;

// evento publicado quando um novo livro e cadastrado no catalogo
public record BookCreatedEvent(
        Long bookId,
        Integer stock
) {
}
