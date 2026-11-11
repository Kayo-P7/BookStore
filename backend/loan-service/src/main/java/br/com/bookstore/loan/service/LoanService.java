package br.com.bookstore.loan.service;

import br.com.bookstore.loan.client.CatalogClient;
import br.com.bookstore.loan.client.CustomerClient;
import br.com.bookstore.loan.client.dto.CatalogBookResponse;
import br.com.bookstore.loan.dto.BookLoanInventoryRequestDTO;
import br.com.bookstore.loan.dto.BookLoanInventoryResponseDTO;
import br.com.bookstore.loan.dto.LoanRequestDTO;
import br.com.bookstore.loan.dto.LoanResponseDTO;
import br.com.bookstore.loan.exception.BusinessConflictException;
import br.com.bookstore.loan.exception.ResourceNotFoundException;
import br.com.bookstore.loan.messaging.LoanEventPublisher;
import br.com.bookstore.loan.model.BookLoanInventory;
import br.com.bookstore.loan.model.Loan;
import br.com.bookstore.loan.model.LoanStatus;
import br.com.bookstore.loan.repository.BookLoanInventoryRepository;
import br.com.bookstore.loan.repository.LoanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

// servico de regras de negocio para emprestimos, devolucoes e inventario de copias
@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final BookLoanInventoryRepository inventoryRepository;
    private final CatalogClient catalogClient;
    private final CustomerClient customerClient;
    private final LoanEventPublisher loanEventPublisher;

    public LoanService(
            LoanRepository loanRepository,
            BookLoanInventoryRepository inventoryRepository,
            CatalogClient catalogClient,
            CustomerClient customerClient,
            LoanEventPublisher loanEventPublisher
    ) {
        this.loanRepository = loanRepository;
        this.inventoryRepository = inventoryRepository;
        this.catalogClient = catalogClient;
        this.customerClient = customerClient;
        this.loanEventPublisher = loanEventPublisher;
    }

    @Transactional
    public LoanResponseDTO createLoan(LoanRequestDTO request) {
        CatalogBookResponse book = catalogClient.getBookById(request.bookId());
        customerClient.validateCustomerExists(request.customerId());

        // garante compatibilidade com livros ja existentes antes da ativacao do evento rabbitmq
        BookLoanInventory inventory = inventoryRepository
                .findByBookId(request.bookId())
                .orElseGet(() -> inventoryRepository.save(BookLoanInventory.initialize(book.id(), book.stock())));

        if (inventory.getAvailableCopies() <= 0) {
            throw new BusinessConflictException("No copies available for loan");
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
        loanEventPublisher.publishLoanCreated(savedLoan);

        return toResponse(savedLoan);
    }

    @Transactional
    public LoanResponseDTO returnLoan(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + loanId));

        if (loan.getStatus() != LoanStatus.ACTIVE) {
            throw new BusinessConflictException("Loan is not active");
        }

        BookLoanInventory inventory = inventoryRepository
                .findByBookId(loan.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book inventory not found: " + loan.getBookId()));

        loan.setReturnDate(LocalDate.now());
        loan.setStatus(LoanStatus.RETURNED);

        inventory.setAvailableCopies(inventory.getAvailableCopies() + 1);
        inventory.setBorrowedCopies(Math.max(inventory.getBorrowedCopies() - 1, 0));

        inventoryRepository.save(inventory);
        Loan returnedLoan = loanRepository.save(loan);
        loanEventPublisher.publishLoanReturned(returnedLoan);

        return toResponse(returnedLoan);
    }

    @Transactional
    public BookLoanInventoryResponseDTO registerInventory(BookLoanInventoryRequestDTO request) {
        catalogClient.getBookById(request.bookId());

        if (inventoryRepository.existsByBookId(request.bookId())) {
            throw new BusinessConflictException("Inventory already registered for this book");
        }

        BookLoanInventory saved = inventoryRepository.save(
                BookLoanInventory.initialize(request.bookId(), request.totalCopies())
        );
        return toInventoryResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookLoanInventoryResponseDTO> findAllInventories() {
        return inventoryRepository.findAll()
                .stream()
                .map(this::toInventoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookLoanInventoryResponseDTO findInventoryByBookId(Long bookId) {
        BookLoanInventory inventory = inventoryRepository.findByBookId(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book inventory not found: " + bookId));
        return toInventoryResponse(inventory);
    }

    @Transactional(readOnly = true)
    public List<LoanResponseDTO> findAllLoans() {
        return loanRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public LoanResponseDTO findLoanById(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + loanId));

        return toResponse(loan);
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

    private BookLoanInventoryResponseDTO toInventoryResponse(BookLoanInventory inventory) {
        return new BookLoanInventoryResponseDTO(
                inventory.getId(),
                inventory.getBookId(),
                inventory.getTotalCopies(),
                inventory.getAvailableCopies(),
                inventory.getBorrowedCopies()
        );
    }
}
