
package br.com.bookstore.loan.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record BookLoanInventoryRequestDTO(

        @NotNull(message = "Book ID is required")
        @Positive(message = "Book ID must be positive")
        Long bookId,

        @NotNull(message = "Total copies is required")
        @Positive(message = "Total copies must be positive")
        Integer totalCopies

) {}
