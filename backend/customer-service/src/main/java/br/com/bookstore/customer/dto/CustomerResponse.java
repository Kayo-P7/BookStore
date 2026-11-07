package br.com.bookstore.customer.dto;

public record CustomerResponse(
    Long id,
    String name,
    String email,
    String phone,
    String cep,
    String street,
    String neighborhood,
    String city,
    String state
) {
}
