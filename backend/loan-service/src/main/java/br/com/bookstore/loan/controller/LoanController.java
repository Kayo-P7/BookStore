package br.com.bookstore.loan.controller;

import br.com.bookstore.loan.dto.BookLoanInventoryRequestDTO;
import br.com.bookstore.loan.dto.BookLoanInventoryResponseDTO;
import br.com.bookstore.loan.dto.LoanRequestDTO;
import br.com.bookstore.loan.dto.LoanResponseDTO;
import br.com.bookstore.loan.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// controlador rest para operacoes de emprestimos, devolucoes e inventario
@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LoanResponseDTO createLoan(@Valid @RequestBody LoanRequestDTO request) {
        return loanService.createLoan(request);
    }

    @PutMapping("/{loanId}/return")
    public LoanResponseDTO returnLoan(@PathVariable Long loanId) {
        return loanService.returnLoan(loanId);
    }

    @PostMapping("/inventory")
    @ResponseStatus(HttpStatus.CREATED)
    public BookLoanInventoryResponseDTO registerInventory(
            @Valid @RequestBody BookLoanInventoryRequestDTO request
    ) {
        return loanService.registerInventory(request);
    }

    @GetMapping("/inventory")
    public List<BookLoanInventoryResponseDTO> findAllInventories() {
        return loanService.findAllInventories();
    }

    @GetMapping("/inventory/{bookId}")
    public BookLoanInventoryResponseDTO findInventoryByBookId(@PathVariable Long bookId) {
        return loanService.findInventoryByBookId(bookId);
    }

    @GetMapping
    public List<LoanResponseDTO> findAllLoans() {
        return loanService.findAllLoans();
    }

    @GetMapping("/{loanId}")
    public LoanResponseDTO findLoanById(@PathVariable Long loanId) {
        return loanService.findLoanById(loanId);
    }
}
