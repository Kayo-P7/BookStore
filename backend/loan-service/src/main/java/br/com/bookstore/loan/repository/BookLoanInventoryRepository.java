package br.com.bookstore.loan.repository;

import br.com.bookstore.loan.model.BookLoanInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BookLoanInventoryRepository extends JpaRepository<BookLoanInventory, Long> {

    Optional<BookLoanInventory> findByBookId(Long bookId);

    boolean existsByBookId(Long bookId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE BookLoanInventory i SET i.availableCopies = i.availableCopies - 1, i.borrowedCopies = i.borrowedCopies + 1 WHERE i.bookId = :bookId AND i.availableCopies > 0")
    int borrowCopyIfAvailable(@Param("bookId") Long bookId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE BookLoanInventory i SET i.availableCopies = i.availableCopies + 1, i.borrowedCopies = CASE WHEN i.borrowedCopies > 0 THEN i.borrowedCopies - 1 ELSE 0 END WHERE i.bookId = :bookId")
    int returnCopy(@Param("bookId") Long bookId);
}