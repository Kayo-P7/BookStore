package br.com.bookstore.customer.dto;

import java.time.Instant;

// dto de saida seguro para representacao de operadores do sistema
public record UserResponse(
    Long id,
    String name,
    String email,
    String role,
    boolean active,
    Instant createdAt,
    Instant updatedAt
) {
}
