package br.com.bookstore.customer.dto;

// resposta padrao de autenticacao com tokens e dados basicos do operador
public record AuthResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    Long userId,
    String name,
    String email,
    String role,
    boolean mustChangePassword
) {
    public AuthResponse(String accessToken, String refreshToken, Long userId, String name, String email, String role, boolean mustChangePassword) {
        this(accessToken, refreshToken, "Bearer", userId, name, email, role, mustChangePassword);
    }

    public AuthResponse(String accessToken, String refreshToken, Long userId, String name, String email, String role) {
        this(accessToken, refreshToken, "Bearer", userId, name, email, role, false);
    }
}
