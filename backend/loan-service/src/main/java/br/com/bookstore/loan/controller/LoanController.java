package br.com.bookstore.loan.controller;

import br.com.bookstore.loan.dto.BookLoanInventoryRequestDTO;
import br.com.bookstore.loan.dto.BookLoanInventoryResponseDTO;
import br.com.bookstore.loan.dto.LoanRequestDTO;
import br.com.bookstore.loan.dto.LoanResponseDTO;
import br.com.bookstore.loan.service.LoanService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
    public List<BookLoanInventoryResponseDTO> findAllInventories(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            HttpServletResponse response
    ) {
        if (page == null && size == null) {
            return loanService.findAllInventories();
        }
        Page<BookLoanInventoryResponseDTO> result = loanService.findInventoriesPage(
                PageRequest.of(Math.max(page != null ? page : 0, 0), Math.clamp(size != null ? size : 20, 1, 200), Sort.by("id").descending())
        );
        response.setHeader("X-Total-Count", String.valueOf(result.getTotalElements()));
        return result.getContent();
    }

    @GetMapping("/inventory/{bookId}")
    public BookLoanInventoryResponseDTO findInventoryByBookId(@PathVariable Long bookId) {
        return loanService.findInventoryByBookId(bookId);
    }

    @GetMapping
    public List<LoanResponseDTO> findAllLoans(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            HttpServletResponse response
    ) {
        if (page == null && size == null) {
            return loanService.findAllLoans();
        }
        Page<LoanResponseDTO> result = loanService.findLoansPage(
                PageRequest.of(Math.max(page != null ? page : 0, 0), Math.clamp(size != null ? size : 20, 1, 200), Sort.by("id").descending())
        );
        response.setHeader("X-Total-Count", String.valueOf(result.getTotalElements()));
        return result.getContent();
    }

    @GetMapping("/paged")
    public Page<LoanResponseDTO> findLoansPaged(@PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return loanService.findLoansPage(pageable);
    }

    @GetMapping("/{loanId}")
    public LoanResponseDTO findLoanById(@PathVariable Long loanId) {
        return loanService.findLoanById(loanId);
    }
}
