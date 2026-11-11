package br.com.bookstore.loan.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_book_loan_inventory")
public class BookLoanInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long bookId;

    @Column(nullable = false)
    private Integer totalCopies;

    @Column(nullable = false)
    private Integer availableCopies;

    @Column(nullable = false)
    private Integer borrowedCopies;

    public BookLoanInventory() {
    }

    public static BookLoanInventory initialize(Long bookId, Integer totalCopies) {
        int copies = totalCopies != null ? Math.max(totalCopies, 0) : 0;
        BookLoanInventory inventory = new BookLoanInventory();
        inventory.setBookId(bookId);
        inventory.setTotalCopies(copies);
        inventory.setAvailableCopies(copies);
        inventory.setBorrowedCopies(0);
        return inventory;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public Integer getTotalCopies() {
        return totalCopies;
    }

    public void setTotalCopies(Integer totalCopies) {
        this.totalCopies = totalCopies;
    }

    public Integer getAvailableCopies() {
        return availableCopies;
    }

    public void setAvailableCopies(Integer availableCopies) {
        this.availableCopies = availableCopies;
    }

    public Integer getBorrowedCopies() {
        return borrowedCopies;
    }

    public void setBorrowedCopies(Integer borrowedCopies) {
        this.borrowedCopies = borrowedCopies;
    }
}
