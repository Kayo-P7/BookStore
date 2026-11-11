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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoanServiceTest {

    @Mock
    private LoanRepository loanRepository;

    @Mock
    private BookLoanInventoryRepository inventoryRepository;

    @Mock
    private CatalogClient catalogClient;

    @Mock
    private CustomerClient customerClient;

    @Mock
    private LoanEventPublisher loanEventPublisher;

    @InjectMocks
    private LoanService loanService;

    @Test
    @DisplayName("deve criar emprestimo usando inventario existente e publicar evento")
    void shouldCreateLoanWithExistingInventory() {
        LocalDate dueDate = LocalDate.now().plusDays(7);
        BookLoanInventory inventory = BookLoanInventory.initialize(10L, 3);
        when(catalogClient.getBookById(10L)).thenReturn(new CatalogBookResponse(10L, "Clean Code", 3));
        when(inventoryRepository.findByBookId(10L)).thenReturn(Optional.of(inventory));
        when(loanRepository.save(any(Loan.class))).thenAnswer(inv -> {
            Loan loan = inv.getArgument(0);
            loan.setId(1L);
            return loan;
        });

        LoanResponseDTO response = loanService.createLoan(new LoanRequestDTO(10L, 5L, dueDate));

        assertEquals(1L, response.id());
        assertEquals(LoanStatus.ACTIVE, response.status());
        assertEquals(2, inventory.getAvailableCopies());
        assertEquals(1, inventory.getBorrowedCopies());
        verify(customerClient).validateCustomerExists(5L);
        verify(loanEventPublisher).publishLoanCreated(any(Loan.class));
    }

    @Test
    @DisplayName("deve inicializar inventario sob demanda para livro preexistente no catalogo")
    void shouldInitializeInventoryFromCatalogWhenMissing() {
        LocalDate dueDate = LocalDate.now().plusDays(5);
        when(catalogClient.getBookById(20L)).thenReturn(new CatalogBookResponse(20L, "DDD", 2));
        when(inventoryRepository.findByBookId(20L)).thenReturn(Optional.empty());
        when(inventoryRepository.save(any(BookLoanInventory.class))).thenAnswer(inv -> inv.getArgument(0));
        when(loanRepository.save(any(Loan.class))).thenAnswer(inv -> {
            Loan loan = inv.getArgument(0);
            loan.setId(2L);
            return loan;
        });

        LoanResponseDTO response = loanService.createLoan(new LoanRequestDTO(20L, 7L, dueDate));

        assertEquals(LoanStatus.ACTIVE, response.status());
        verify(inventoryRepository, times(2)).save(any(BookLoanInventory.class));
        verify(loanEventPublisher).publishLoanCreated(any(Loan.class));
    }

    @Test
    @DisplayName("deve lancar conflito quando nao houver exemplares disponiveis")
    void shouldThrowConflictWhenNoCopiesAvailable() {
        BookLoanInventory inventory = BookLoanInventory.initialize(10L, 1);
        inventory.setAvailableCopies(0);
        inventory.setBorrowedCopies(1);

        when(catalogClient.getBookById(10L)).thenReturn(new CatalogBookResponse(10L, "Clean Code", 1));
        when(inventoryRepository.findByBookId(10L)).thenReturn(Optional.of(inventory));

        assertThrows(
                BusinessConflictException.class,
                () -> loanService.createLoan(new LoanRequestDTO(10L, 5L, LocalDate.now().plusDays(3)))
        );
        verify(loanRepository, never()).save(any());
        verifyNoInteractions(loanEventPublisher);
    }

    @Test
    @DisplayName("deve registrar devolucao com sucesso e atualizar inventario")
    void shouldReturnActiveLoanSuccessfully() {
        Loan loan = new Loan();
        loan.setId(9L);
        loan.setBookId(10L);
        loan.setCustomerId(5L);
        loan.setLoanDate(LocalDate.now().minusDays(2));
        loan.setDueDate(LocalDate.now().plusDays(5));
        loan.setStatus(LoanStatus.ACTIVE);

        BookLoanInventory inventory = BookLoanInventory.initialize(10L, 2);
        inventory.setAvailableCopies(1);
        inventory.setBorrowedCopies(1);

        when(loanRepository.findById(9L)).thenReturn(Optional.of(loan));
        when(inventoryRepository.findByBookId(10L)).thenReturn(Optional.of(inventory));
        when(loanRepository.save(any(Loan.class))).thenAnswer(inv -> inv.getArgument(0));

        LoanResponseDTO response = loanService.returnLoan(9L);

        assertEquals(LoanStatus.RETURNED, response.status());
        assertNotNull(response.returnDate());
        assertEquals(2, inventory.getAvailableCopies());
        assertEquals(0, inventory.getBorrowedCopies());
        verify(loanEventPublisher).publishLoanReturned(loan);
    }

    @Test
    @DisplayName("deve lancar erro 404 ao consultar emprestimo inexistente")
    void shouldThrowNotFoundForMissingLoan() {
        when(loanRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> loanService.findLoanById(99L));
    }

    @Test
    @DisplayName("deve registrar inventario manual quando ainda nao existir")
    void shouldRegisterInventoryWhenAbsent() {
        when(catalogClient.getBookById(10L)).thenReturn(new CatalogBookResponse(10L, "Clean Code", 4));
        when(inventoryRepository.existsByBookId(10L)).thenReturn(false);
        when(inventoryRepository.save(any(BookLoanInventory.class))).thenAnswer(inv -> {
            BookLoanInventory saved = inv.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        BookLoanInventoryResponseDTO response = loanService.registerInventory(new BookLoanInventoryRequestDTO(10L, 4));

        assertEquals(10L, response.bookId());
        assertEquals(4, response.totalCopies());
        assertEquals(4, response.availableCopies());
        assertEquals(0, response.borrowedCopies());
    }
}
