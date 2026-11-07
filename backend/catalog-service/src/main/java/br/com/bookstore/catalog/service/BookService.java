package br.com.bookstore.catalog.service;

import br.com.bookstore.catalog.dto.BookRequest;
import br.com.bookstore.catalog.dto.BookResponse;
import br.com.bookstore.catalog.mapper.BookMapper;
import br.com.bookstore.catalog.model.Book;
import br.com.bookstore.catalog.repository.BookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookService {

    private final BookRepository repo;
    private final BookMapper mapper;

    public BookService(BookRepository repo, BookMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    public List<BookResponse> findAll() {
        return mapper.toResponseList(repo.findAll());
    }

    public BookResponse findById(Long id) {
        return mapper.toResponse(findEntityById(id));
    }

    public List<BookResponse> search(String title) {
        return mapper.toResponseList(repo.findByTitleContainingIgnoreCase(title));
    }

    @Transactional
    public BookResponse save(BookRequest request) {
        Book book = mapper.toEntity(request);
        return mapper.toResponse(repo.save(book));
    }

    @Transactional
    public BookResponse update(Long id, BookRequest request) {
        Book book = findEntityById(id);
        mapper.updateEntityFromRequest(request, book);
        return mapper.toResponse(repo.save(book));
    }

    @Transactional
    public void delete(Long id) {
        repo.delete(findEntityById(id));
    }

    @Transactional
    public BookResponse decreaseStock(Long id, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser positiva");
        }
        Book book = findEntityById(id);
        if (book.getStock() == null || book.getStock() < quantity) {
            throw new IllegalStateException("Estoque insuficiente");
        }
        book.setStock(book.getStock() - quantity);
        return mapper.toResponse(repo.save(book));
    }

    public Book findEntityById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Livro não encontrado: " + id));
    }
}
