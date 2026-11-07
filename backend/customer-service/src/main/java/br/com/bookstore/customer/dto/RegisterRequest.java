package br.com.bookstore.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// dados de requisicao para cadastro de novo cliente com credenciais
public record RegisterRequest(
    @NotBlank(message = "O nome é obrigatório")
    String name,

    @Email(message = "Formato de e-mail inválido")
    @NotBlank(message = "O e-mail é obrigatório")
    String email,

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 6, message = "A senha deve conter no mínimo 6 caracteres")
    String password,

    String phone,
    String cep,
    String street,
    String neighborhood,
    String city,
    String state
) {
}
