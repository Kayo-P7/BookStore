package br.com.bookstore.catalog.service;

import br.com.bookstore.catalog.dto.BookRequest;
import br.com.bookstore.catalog.dto.BookResponse;
import br.com.bookstore.catalog.mapper.BookMapper;
import br.com.bookstore.catalog.model.Book;
import br.com.bookstore.catalog.repository.BookRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository repo;

    @Mock
    private BookMapper mapper;

    @InjectMocks
    private BookService service;

    private Book sampleBook;

    @BeforeEach
    void setUp() {
        sampleBook = new Book(
                "Refactoring", "Martin Fowler", "9780134757599", "Addison-Wesley",
                "Improving the Design of Existing Code", new BigDecimal("150.00"), 10
        );
        try {
            var idField = Book.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(sampleBook, 1L);
        } catch (Exception ignored) {
        }
    }

    @Test
    @DisplayName("deve listar todos os livros cadastrados")
    void shouldFindAllBooks() {
        when(repo.findAll()).thenReturn(List.of(sampleBook));
        when(mapper.toResponseList(any())).thenReturn(List.of(
                new BookResponse(1L, "Refactoring", "Martin Fowler", "9780134757599", "Addison-Wesley", "desc", new BigDecimal("150.00"), 10)
        ));

        List<BookResponse> list = service.findAll();

        assertEquals(1, list.size());
        assertEquals("Refactoring", list.getFirst().title());
    }

    @Test
    @DisplayName("deve salvar novo livro quando isbn for unico")
    void shouldSaveBookSuccessfullyWhenIsbnIsUnique() {
        BookRequest request = new BookRequest(
                "Refactoring", "Martin Fowler", "9780134757599", "Addison-Wesley",
                "desc", new BigDecimal("150.00"), 10
        );

        when(repo.existsByIsbn(request.isbn())).thenReturn(false);
        when(mapper.toEntity(request)).thenReturn(sampleBook);
        when(repo.save(sampleBook)).thenReturn(sampleBook);
        when(mapper.toResponse(sampleBook)).thenReturn(
                new BookResponse(1L, "Refactoring", "Martin Fowler", "9780134757599", "Addison-Wesley", "desc", new BigDecimal("150.00"), 10)
        );

        BookResponse response = service.save(request);

        assertNotNull(response);
        assertEquals("9780134757599", response.isbn());
        verify(repo).save(sampleBook);
    }

    @Test
    @DisplayName("deve lancar excecao ao tentar salvar livro com isbn duplicado")
    void shouldThrowExceptionWhenSavingDuplicateIsbn() {
        BookRequest request = new BookRequest(
                "Outro Livro", "Autor", "9780134757599", "Editora", "desc", new BigDecimal("100.00"), 5
        );

        when(repo.existsByIsbn("9780134757599")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> service.save(request));
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("deve decrementar estoque com sucesso")
    void shouldDecreaseStockSuccessfully() {
        when(repo.findById(1L)).thenReturn(Optional.of(sampleBook));
        when(repo.save(any(Book.class))).thenReturn(sampleBook);
        when(mapper.toResponse(sampleBook)).thenReturn(
                new BookResponse(1L, "Refactoring", "Martin Fowler", "9780134757599", "Addison-Wesley", "desc", new BigDecimal("150.00"), 8)
        );

        BookResponse response = service.decreaseStock(1L, 2);

        assertNotNull(response);
        assertEquals(8, sampleBook.getStock());
        verify(repo).save(sampleBook);
    }

    @Test
    @DisplayName("deve lancar excecao ao tentar decrementar estoque insuficiente")
    void shouldThrowExceptionWhenStockIsInsufficient() {
        when(repo.findById(1L)).thenReturn(Optional.of(sampleBook));

        assertThrows(IllegalStateException.class, () -> service.decreaseStock(1L, 20));
        verify(repo, never()).save(any());
    }
}
