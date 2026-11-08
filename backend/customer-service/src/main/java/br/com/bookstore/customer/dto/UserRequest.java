package br.com.bookstore.customer.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// dto de entrada para cadastro de operadores do sistema
@JsonIgnoreProperties(ignoreUnknown = true)
public record UserRequest(
    @NotBlank(message = "O nome é obrigatório")
    String name,

    @Email(message = "Formato de e-mail inválido")
    @NotBlank(message = "O e-mail é obrigatório")
    String email,

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 6, message = "A senha deve conter no mínimo 6 caracteres")
    String password,

    @NotBlank(message = "O papel é obrigatório (ADMIN ou SELLER)")
    String role,

    Boolean active
) {
    public UserRequest(String name, String email, String password, String role) {
        this(name, email, password, role, true);
    }
}
