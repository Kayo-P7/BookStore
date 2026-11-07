package br.com.bookstore.catalog.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record BookRequest(
    @NotBlank(message = "O título é obrigatório")
    String title,

    String authors,
    String isbn,
    String publisher,
    String description,

    @NotNull(message = "O preço é obrigatório")
    @DecimalMin(value = "0.0", message = "O preço não pode ser negativo")
    BigDecimal price,

    @Min(value = 0, message = "O estoque não pode ser negativo")
    Integer stock
) {
}
