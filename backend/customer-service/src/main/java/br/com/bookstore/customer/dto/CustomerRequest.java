package br.com.bookstore.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// dto com dados de entrada para criacao e atualizacao de cliente
public record CustomerRequest(
    @NotBlank(message = "O nome é obrigatório")
    String name,

    @Email(message = "Formato de e-mail inválido")
    @NotBlank(message = "O e-mail é obrigatório")
    String email,

    String phone,
    String cep,
    String street,
    String neighborhood,
    String city,
    String state
) {
}
