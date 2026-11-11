package br.com.bookstore.loan.repository;

import br.com.bookstore.loan.model.BookLoanInventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BookLoanInventoryRepository extends JpaRepository<BookLoanInventory, Long> {

    Optional<BookLoanInventory> findByBookId(Long bookId);

    boolean existsByBookId(Long bookId);
}