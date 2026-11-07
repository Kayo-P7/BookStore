package br.com.bookstore.sales.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

// entidade jpa que representa a tabela de vendas no banco de dados
@Entity
@Table(name = "sales")
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long customerId;
    private Long bookId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal total;
    private Instant createdAt = Instant.now();

    public Sale() {
    }

    public Sale(Long c, Long b, Integer q, BigDecimal p) {
        customerId = c;
        bookId = b;
        quantity = q;
        unitPrice = p;
        total = p.multiply(BigDecimal.valueOf(q));
    }

    public Long getId() {
        return id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public Long getBookId() {
        return bookId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
