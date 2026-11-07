package br.com.bookstore.sales.dto;

import java.math.BigDecimal;
import java.time.Instant;

// dto com dados de saida para representacao de venda realizada
public record SaleResponse(
    Long id,
    Long customerId,
    Long bookId,
    Integer quantity,
    BigDecimal unitPrice,
    BigDecimal total,
    Instant createdAt
) {
}
