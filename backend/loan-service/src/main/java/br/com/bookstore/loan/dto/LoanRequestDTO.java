package br.com.bookstore.loan.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.FutureOrPresent;

import java.time.LocalDate;

public record LoanRequestDTO(

        @NotNull(message = "Book ID is required")
        Long bookId,

        @NotNull(message = "Customer ID is required")
        Long customerId,

        @NotNull(message = "Due date is required")
        @FutureOrPresent(message = "Due date must be today or in the future")
        LocalDate dueDate

) {
}