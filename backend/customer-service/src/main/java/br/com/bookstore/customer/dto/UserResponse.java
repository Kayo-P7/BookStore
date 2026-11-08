package br.com.bookstore.customer.dto;

import java.time.Instant;

// dto de saida seguro para representacao de operadores do sistema
public record UserResponse(
    Long id,
    String name,
    String email,
    String role,
    boolean active,
    boolean mustChangePassword,
    Instant createdAt,
    Instant updatedAt
) {
    public UserResponse(Long id, String name, String email, String role, boolean active, Instant createdAt, Instant updatedAt) {
        this(id, name, email, role, active, false, createdAt, updatedAt);
    }
}
