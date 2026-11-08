package br.com.bookstore.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// dto de entrada para atualizacao de dados de operadores
public record UserUpdateRequest(
    @NotBlank(message = "O nome é obrigatório")
    String name,

    @Email(message = "Formato de e-mail inválido")
    @NotBlank(message = "O e-mail é obrigatório")
    String email,

    String password,

    @NotBlank(message = "O papel é obrigatório (ADMIN ou SELLER)")
    String role,

    Boolean active
) {
}
