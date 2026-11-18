package br.com.bookstore.catalog.controller;

import br.com.bookstore.catalog.dto.BookRequest;
import br.com.bookstore.catalog.dto.BookResponse;
import br.com.bookstore.catalog.service.BookService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.math.BigDecimal;
import java.util.List;

// controlador graphql para consultas e mutacoes de livros
@Controller
public class GraphQlController {

    private final BookService service;

    public GraphQlController(BookService service) {
        this.service = service;
    }

    // consulta graphql para listar livros com paginacao opcional
    @QueryMapping
    public List<BookResponse> books(@Argument Integer page, @Argument Integer size) {
        if (page == null && size == null) {
            return service.findAll();
        }
        int safePage = Math.max(page != null ? page : 0, 0);
        int safeSize = Math.clamp(size != null ? size : 20, 1, 200);
        return service.findPage(PageRequest.of(safePage, safeSize, Sort.by("id").descending())).getContent();
    }

    // consulta graphql para buscar livros por titulo
    @QueryMapping
    public List<BookResponse> searchBooks(@Argument String title) {
        return service.search(title);
    }

    // consulta graphql para buscar livro por identificador
    @QueryMapping
    public BookResponse book(@Argument Long id) {
        return service.findById(id);
    }

    // mutacao graphql para cadastrar novo livro
    @MutationMapping
    public BookResponse createBook(@Argument String title, @Argument String authors, @Argument String isbn,
                                   @Argument String publisher, @Argument String description,
                                   @Argument BigDecimal price, @Argument Integer stock) {
        return service.save(new BookRequest(title, authors, isbn, publisher, description, price, stock));
    }
}
