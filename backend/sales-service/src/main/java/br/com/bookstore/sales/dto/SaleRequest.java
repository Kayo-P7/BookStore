package br.com.bookstore.sales.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

// dto com dados de entrada para criacao de nova venda
public record SaleRequest(
    @NotNull(message = "ID do cliente é obrigatório")
    Long customerId,

    @NotNull(message = "ID do livro é obrigatório")
    Long bookId,

    @NotNull(message = "Quantidade é obrigatória")
    @Min(value = 1, message = "Quantidade mínima é 1")
    Integer quantity
) {
}
