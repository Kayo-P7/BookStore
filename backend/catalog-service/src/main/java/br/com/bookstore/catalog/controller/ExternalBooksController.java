package br.com.bookstore.catalog.controller;

import br.com.bookstore.catalog.service.GoogleBooksService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

// controlador rest para endpoints de integracao externa com google books
@RestController
@RequestMapping("/api/integrations/google-books")
public class ExternalBooksController {
    private final GoogleBooksService service;

    public ExternalBooksController(GoogleBooksService service) {
        this.service = service;
    }

    // busca livros na api do google books
    @GetMapping
    public Map search(@RequestParam String q) {
        return service.search(q);
    }
}
