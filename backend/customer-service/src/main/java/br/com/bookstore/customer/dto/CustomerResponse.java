package br.com.bookstore.customer.dto;

// dto com dados de saida para representacao de cliente
public record CustomerResponse(
    Long id,
    String name,
    String email,
    String role,
    String phone,
    String cep,
    String street,
    String neighborhood,
    String city,
    String state
) {
}
