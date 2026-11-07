package br.com.bookstore.customer.dto;

import jakarta.validation.constraints.NotBlank;

// dados de requisicao para renovacao de token de acesso
public record RefreshTokenRequest(
    @NotBlank(message = "O refresh token é obrigatório")
    String refreshToken
) {
}
