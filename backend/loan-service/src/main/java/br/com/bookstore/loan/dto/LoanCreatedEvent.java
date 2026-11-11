package br.com.bookstore.loan.dto;

import java.time.LocalDate;

// evento publicado quando um emprestimo e registrado
public record LoanCreatedEvent(
        Long loanId,
        Long bookId,
        Long customerId,
        LocalDate loanDate,
        LocalDate dueDate
) {
}
