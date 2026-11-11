package br.com.bookstore.loan.repository;

import br.com.bookstore.loan.model.Loan;
import br.com.bookstore.loan.model.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByCustomerId(Long customerId);

    List<Loan> findByBookId(Long bookId);

    List<Loan> findByStatus(LoanStatus status);

    List<Loan> findByCustomerIdAndStatus(Long customerId, LoanStatus status);
}