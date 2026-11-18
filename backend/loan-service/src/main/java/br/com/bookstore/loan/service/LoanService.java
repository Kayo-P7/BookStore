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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionOperations;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

// servico de regras de negocio para emprestimos, devolucoes e inventario de copias
@Service
public class LoanService {

    private static final ExecutorService VIRTUAL_EXECUTOR = Executors.newVirtualThreadPerTaskExecutor();

    private final LoanRepository loanRepository;
    private final BookLoanInventoryRepository inventoryRepository;
    private final CatalogClient catalogClient;
    private final CustomerClient customerClient;
    private final LoanEventPublisher loanEventPublisher;
    private TransactionOperations transactionOperations = TransactionOperations.withoutTransaction();

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

    @Autowired(required = false)
    void setTransactionOperations(TransactionOperations transactionOperations) {
        if (transactionOperations != null) {
            this.transactionOperations = transactionOperations;
        }
    }

    // valida catalogo e cliente em paralelo fora da transacao de banco e abate copia atomicamente
    public LoanResponseDTO createLoan(LoanRequestDTO request) {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        CompletableFuture<CatalogBookResponse> bookFuture = CompletableFuture.supplyAsync(() -> {
            SecurityContext previous = SecurityContextHolder.getContext();
            try {
                SecurityContextHolder.setContext(securityContext);
                return catalogClient.getBookById(request.bookId());
            } finally {
                SecurityContextHolder.setContext(previous);
            }
        }, VIRTUAL_EXECUTOR);

        final CatalogBookResponse book;
        try {
            customerClient.validateCustomerExists(request.customerId());
            book = bookFuture.join();
        } catch (CompletionException ex) {
            if (ex.getCause() instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }
            throw ex;
        }

        return transactionOperations.execute(status -> {
            int borrowed = inventoryRepository.borrowCopyIfAvailable(request.bookId());
            if (borrowed == 0) {
                // garante compatibilidade com livros ja existentes antes da ativacao do evento rabbitmq
                BookLoanInventory inventory = inventoryRepository
                        .findByBookId(request.bookId())
                        .orElseGet(() -> BookLoanInventory.initialize(book.id(), book.stock()));

                if (inventory.getAvailableCopies() <= 0) {
                    throw new BusinessConflictException("No copies available for loan");
                }
                inventory.setAvailableCopies(inventory.getAvailableCopies() - 1);
                inventory.setBorrowedCopies(inventory.getBorrowedCopies() + 1);
                inventoryRepository.save(inventory);
            }

            Loan loan = new Loan();
            loan.setBookId(request.bookId());
            loan.setCustomerId(request.customerId());
            loan.setLoanDate(LocalDate.now());
            loan.setDueDate(request.dueDate());
            loan.setStatus(LoanStatus.ACTIVE);

            Loan savedLoan = loanRepository.save(loan);
            loanEventPublisher.publishLoanCreated(savedLoan);
            return toResponse(savedLoan);
        });
    }

    @Transactional
    public LoanResponseDTO returnLoan(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + loanId));

        if (loan.getStatus() != LoanStatus.ACTIVE) {
            throw new BusinessConflictException("Loan is not active");
        }

        int updated = inventoryRepository.returnCopy(loan.getBookId());
        if (updated == 0) {
            throw new ResourceNotFoundException("Book inventory not found: " + loan.getBookId());
        }

        loan.setReturnDate(LocalDate.now());
        loan.setStatus(LoanStatus.RETURNED);

        Loan returnedLoan = loanRepository.save(loan);
        loanEventPublisher.publishLoanReturned(returnedLoan);

        return toResponse(returnedLoan);
    }

    // valida livro no catalogo fora da transacao de banco antes de persistir inventario
    public BookLoanInventoryResponseDTO registerInventory(BookLoanInventoryRequestDTO request) {
        catalogClient.getBookById(request.bookId());

        return transactionOperations.execute(status -> {
            if (inventoryRepository.existsByBookId(request.bookId())) {
                throw new BusinessConflictException("Inventory already registered for this book");
            }

            BookLoanInventory saved = inventoryRepository.save(
                    BookLoanInventory.initialize(request.bookId(), request.totalCopies())
            );
            return toInventoryResponse(saved);
        });
    }

    @Transactional(readOnly = true)
    public List<BookLoanInventoryResponseDTO> findAllInventories() {
        return inventoryRepository.findAll()
                .stream()
                .map(this::toInventoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<BookLoanInventoryResponseDTO> findInventoriesPage(Pageable pageable) {
        return inventoryRepository.findAll(pageable).map(this::toInventoryResponse);
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
    public Page<LoanResponseDTO> findLoansPage(Pageable pageable) {
        return loanRepository.findAll(pageable).map(this::toResponse);
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
