package br.com.bookstore.loan.dto;

import java.time.LocalDate;

// evento publicado quando um emprestimo e devolvido
public record LoanReturnedEvent(
        Long loanId,
        Long bookId,
        Long customerId,
        LocalDate returnDate
) {
}
