package br.com.bookstore.customer.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

// entidade jpa que representa a tabela de clientes no banco de dados
@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank
    private String name;
    @Email
    @NotBlank
    @Column(unique = true)
    private String email;
    private String phone;
    private String cep;
    private String street;
    private String neighborhood;
    private String city;
    private String state;

    public Customer() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getCep() {
        return cep;
    }

    public String getStreet() {
        return street;
    }

    public String getNeighborhood() {
        return neighborhood;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public void setName(String v) {
        name = v;
    }

    public void setEmail(String v) {
        email = v;
    }

    public void setPhone(String v) {
        phone = v;
    }

    public void setCep(String v) {
        cep = v;
    }

    public void setStreet(String v) {
        street = v;
    }

    public void setNeighborhood(String v) {
        neighborhood = v;
    }

    public void setCity(String v) {
        city = v;
    }

    public void setState(String v) {
        state = v;
    }
}
