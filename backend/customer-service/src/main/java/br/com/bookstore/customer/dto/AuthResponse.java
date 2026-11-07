package br.com.bookstore.customer.dto;

// resposta padrao de autenticacao com tokens e dados basicos do usuario
public record AuthResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    Long customerId,
    String name,
    String email,
    String role
) {
    public AuthResponse(String accessToken, String refreshToken, Long customerId, String name, String email, String role) {
        this(accessToken, refreshToken, "Bearer", customerId, name, email, role);
    }
}
