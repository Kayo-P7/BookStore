package br.com.bookstore.loan.dto;

// dto de resposta para inventario de exemplares disponiveis para emprestimo
public record BookLoanInventoryResponseDTO(
        Long id,
        Long bookId,
        Integer totalCopies,
        Integer availableCopies,
        Integer borrowedCopies
) {
}
