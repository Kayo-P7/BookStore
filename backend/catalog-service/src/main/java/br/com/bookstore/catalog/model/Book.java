package br.com.bookstore.catalog.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

// entidade jpa que representa a tabela de livros no banco de dados
@Entity
@Table(name = "books")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank
    private String title;
    private String authors;
    private String isbn;
    private String publisher;
    @Column(length = 3000)
    private String description;
    @NotNull
    @DecimalMin("0.0")
    private BigDecimal price;
    @Min(0)
    private Integer stock;

    public Book() {
    }

    public Book(String title, String authors, String isbn, String publisher, String description, BigDecimal price, Integer stock) {
        this.title = title;
        this.authors = authors;
        this.isbn = isbn;
        this.publisher = publisher;
        this.description = description;
        this.price = price;
        this.stock = stock;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getAuthors() {
        return authors;
    }

    public String getIsbn() {
        return isbn;
    }

    public String getPublisher() {
        return publisher;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public Integer getStock() {
        return stock;
    }

    public void setTitle(String v) {
        title = v;
    }

    public void setAuthors(String v) {
        authors = v;
    }

    public void setIsbn(String v) {
        isbn = v;
    }

    public void setPublisher(String v) {
        publisher = v;
    }

    public void setDescription(String v) {
        description = v;
    }

    public void setPrice(BigDecimal v) {
        price = v;
    }

    public void setStock(Integer v) {
        stock = v;
    }
}
