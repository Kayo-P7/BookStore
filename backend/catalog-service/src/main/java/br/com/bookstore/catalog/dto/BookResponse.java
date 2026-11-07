package br.com.bookstore.catalog.dto;

import java.math.BigDecimal;

// dto com dados de saida para representacao de livro
public record BookResponse(
    Long id,
    String title,
    String authors,
    String isbn,
    String publisher,
    String description,
    BigDecimal price,
    Integer stock
) {
}
