package br.com.bookstore.loan.messaging;

import br.com.bookstore.loan.dto.BookCreatedEvent;
import br.com.bookstore.loan.model.BookLoanInventory;
import br.com.bookstore.loan.repository.BookLoanInventoryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookCreatedListenerTest {

    @Mock
    private BookLoanInventoryRepository inventoryRepository;

    @InjectMocks
    private BookCreatedListener listener;

    @Test
    @DisplayName("deve criar inventario ao receber evento book.created")
    void shouldCreateInventoryOnBookCreatedEvent() {
        when(inventoryRepository.existsByBookId(15L)).thenReturn(false);

        listener.handleBookCreated(new BookCreatedEvent(15L, 6));

        ArgumentCaptor<BookLoanInventory> captor = ArgumentCaptor.forClass(BookLoanInventory.class);
        verify(inventoryRepository).save(captor.capture());
        assertEquals(15L, captor.getValue().getBookId());
        assertEquals(6, captor.getValue().getTotalCopies());
        assertEquals(6, captor.getValue().getAvailableCopies());
        assertEquals(0, captor.getValue().getBorrowedCopies());
    }

    @Test
    @DisplayName("deve ignorar evento duplicado quando inventario ja existir")
    void shouldIgnoreDuplicateBookCreatedEvent() {
        when(inventoryRepository.existsByBookId(15L)).thenReturn(true);

        listener.handleBookCreated(new BookCreatedEvent(15L, 6));

        verify(inventoryRepository, never()).save(any());
    }
}
