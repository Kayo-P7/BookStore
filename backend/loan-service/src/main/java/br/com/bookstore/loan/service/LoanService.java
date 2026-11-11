
package br.com.bookstore.loan.service;

import br.com.bookstore.loan.dto.LoanRequestDTO;
import br.com.bookstore.loan.dto.LoanResponseDTO;
import br.com.bookstore.loan.model.BookLoanInventory;
import br.com.bookstore.loan.model.Loan;
import br.com.bookstore.loan.model.LoanStatus;
import br.com.bookstore.loan.repository.BookLoanInventoryRepository;
import br.com.bookstore.loan.repository.LoanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.bookstore.loan.dto.BookLoanInventoryRequestDTO;
import java.time.LocalDate;
import br.com.bookstore.loan.dto.BookLoanInventoryRequestDTO;
import br.com.bookstore.loan.model.BookLoanInventory;
@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final BookLoanInventoryRepository inventoryRepository;

    public LoanService(
            LoanRepository loanRepository,
            BookLoanInventoryRepository inventoryRepository
    ) {
        this.loanRepository = loanRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional
    public LoanResponseDTO createLoan(LoanRequestDTO request) {

        BookLoanInventory inventory = inventoryRepository
                .findByBookId(request.bookId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Book inventory not found")
                );

        if (inventory.getAvailableCopies() <= 0) {
            throw new IllegalStateException("No copies available for loan");
        }

        inventory.setAvailableCopies(inventory.getAvailableCopies() - 1);
        inventory.setBorrowedCopies(inventory.getBorrowedCopies() + 1);

        Loan loan = new Loan();
        loan.setBookId(request.bookId());
        loan.setCustomerId(request.customerId());
        loan.setLoanDate(LocalDate.now());
        loan.setDueDate(request.dueDate());
        loan.setStatus(LoanStatus.ACTIVE);

        inventoryRepository.save(inventory);
        Loan savedLoan = loanRepository.save(loan);

        return toResponse(savedLoan);
    }

    @Transactional
    public LoanResponseDTO returnLoan(Long loanId) {

        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Loan not found")
                );

        if (loan.getStatus() != LoanStatus.ACTIVE) {
            throw new IllegalStateException("Loan is not active");
        }

        BookLoanInventory inventory = inventoryRepository
                .findByBookId(loan.getBookId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Book inventory not found")
                );

        loan.setReturnDate(LocalDate.now());
        loan.setStatus(LoanStatus.RETURNED);

        inventory.setAvailableCopies(inventory.getAvailableCopies() + 1);
        inventory.setBorrowedCopies(inventory.getBorrowedCopies() - 1);

        inventoryRepository.save(inventory);
        Loan returnedLoan = loanRepository.save(loan);

        return toResponse(returnedLoan);
    }

    private LoanResponseDTO toResponse(Loan loan) {
        return new LoanResponseDTO(
                loan.getId(),
                loan.getBookId(),
                loan.getCustomerId(),
                loan.getLoanDate(),
                loan.getDueDate(),
                loan.getReturnDate(),
                loan.getStatus()
        );
    }

    @Transactional
    public BookLoanInventory registerInventory(BookLoanInventoryRequestDTO request) {

        if (inventoryRepository.existsByBookId(request.bookId())) {
            throw new IllegalStateException("Inventory already registered for this book");
        }

        BookLoanInventory inventory = new BookLoanInventory();

        inventory.setBookId(request.bookId());
        inventory.setTotalCopies(request.totalCopies());
        inventory.setAvailableCopies(request.totalCopies());
        inventory.setBorrowedCopies(0);

        return inventoryRepository.save(inventory);
    }
}
