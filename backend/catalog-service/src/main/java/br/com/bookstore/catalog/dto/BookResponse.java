package br.com.bookstore.catalog.dto;

import java.math.BigDecimal;

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
