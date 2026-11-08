package br.com.bookstore.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// dto para solicitacao de alteracao de senha ou conclusao do primeiro acesso
public record ChangePasswordRequest(
    String email,

    @NotBlank(message = "A senha atual é obrigatória")
    String currentPassword,

    @NotBlank(message = "A nova senha é obrigatória")
    @Size(min = 8, message = "A nova senha deve conter no mínimo 8 caracteres")
    String newPassword
) {}
