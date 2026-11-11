package br.com.bookstore.loan.dto;

import br.com.bookstore.loan.model.LoanStatus;

import java.time.LocalDate;

public record LoanResponseDTO(
        Long id,
        Long bookId,
        Long customerId,
        LocalDate loanDate,
        LocalDate dueDate,
        LocalDate returnDate,
        LoanStatus status
) {
}