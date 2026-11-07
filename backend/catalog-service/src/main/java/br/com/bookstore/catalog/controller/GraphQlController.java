package br.com.bookstore.catalog.controller;

import br.com.bookstore.catalog.dto.BookRequest;
import br.com.bookstore.catalog.dto.BookResponse;
import br.com.bookstore.catalog.service.BookService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.math.BigDecimal;
import java.util.List;

@Controller
public class GraphQlController {

    private final BookService service;

    public GraphQlController(BookService service) {
        this.service = service;
    }

    @QueryMapping
    public List<BookResponse> books() {
        return service.findAll();
    }

    @QueryMapping
    public List<BookResponse> searchBooks(@Argument String title) {
        return service.search(title);
    }

    @QueryMapping
    public BookResponse book(@Argument Long id) {
        return service.findById(id);
    }

    @MutationMapping
    public BookResponse createBook(@Argument String title, @Argument String authors, @Argument String isbn,
                                   @Argument String publisher, @Argument String description,
                                   @Argument BigDecimal price, @Argument Integer stock) {
        return service.save(new BookRequest(title, authors, isbn, publisher, description, price, stock));
    }
}
