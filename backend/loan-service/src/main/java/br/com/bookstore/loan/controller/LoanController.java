
package br.com.bookstore.loan.controller;

import br.com.bookstore.loan.dto.BookLoanInventoryRequestDTO;
import br.com.bookstore.loan.dto.LoanRequestDTO;
import br.com.bookstore.loan.dto.LoanResponseDTO;
import br.com.bookstore.loan.model.BookLoanInventory;
import br.com.bookstore.loan.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LoanResponseDTO createLoan(
            @Valid @RequestBody LoanRequestDTO request
    ) {
        return loanService.createLoan(request);
    }

    @PutMapping("/{loanId}/return")
    public LoanResponseDTO returnLoan(@PathVariable Long loanId) {
        return loanService.returnLoan(loanId);
    }

    @PostMapping("/inventory")
    @ResponseStatus(HttpStatus.CREATED)
    public BookLoanInventory registerInventory(
            @Valid @RequestBody BookLoanInventoryRequestDTO request
    ) {
        return loanService.registerInventory(request);
    }
}
