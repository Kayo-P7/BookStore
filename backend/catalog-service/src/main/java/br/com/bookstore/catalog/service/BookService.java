package br.com.bookstore.catalog.service;

import br.com.bookstore.catalog.dto.BookRequest;
import br.com.bookstore.catalog.dto.BookResponse;
import br.com.bookstore.catalog.mapper.BookMapper;
import br.com.bookstore.catalog.model.Book;
import br.com.bookstore.catalog.repository.BookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// servico de regras de negocio para operacoes do catalogo de livros
@Service
public class BookService {

    private final BookRepository repo;
    private final BookMapper mapper;

    public BookService(BookRepository repo, BookMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    // retorna todos os livros cadastrados em formato de resposta
    public List<BookResponse> findAll() {
        return mapper.toResponseList(repo.findAll());
    }

    // busca livro por identificador e converte para dto
    public BookResponse findById(Long id) {
        return mapper.toResponse(findEntityById(id));
    }

    // pesquisa livros por termo no titulo
    public List<BookResponse> search(String title) {
        return mapper.toResponseList(repo.findByTitleContainingIgnoreCase(title));
    }

    // cadastra novo livro a partir dos dados recebidos
    @Transactional
    public BookResponse save(BookRequest request) {
        Book book = mapper.toEntity(request);
        return mapper.toResponse(repo.save(book));
    }

    // atualiza livro existente preservando seu identificador
    @Transactional
    public BookResponse update(Long id, BookRequest request) {
        Book book = findEntityById(id);
        mapper.updateEntityFromRequest(request, book);
        return mapper.toResponse(repo.save(book));
    }

    // remove livro pelo identificador informado
    @Transactional
    public void delete(Long id) {
        repo.delete(findEntityById(id));
    }

    // decrementa estoque de forma transacional apos validar disponibilidade
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

    // busca a entidade no banco de dados lancando excecao caso nao exista
    public Book findEntityById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Livro não encontrado: " + id));
    }
}
