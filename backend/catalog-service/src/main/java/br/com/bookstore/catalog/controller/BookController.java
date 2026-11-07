package br.com.bookstore.catalog.controller;

import br.com.bookstore.catalog.dto.BookRequest;
import br.com.bookstore.catalog.dto.BookResponse;
import br.com.bookstore.catalog.service.BookService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/catalog/books")
public class BookController {

    private final BookService service;

    public BookController(BookService service) {
        this.service = service;
    }

    @GetMapping
    public List<BookResponse> all() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public BookResponse one(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/search")
    public List<BookResponse> search(@RequestParam String title) {
        return service.search(title);
    }

    @PostMapping
    public BookResponse create(@Valid @RequestBody BookRequest request) {
        return service.save(request);
    }

    @PutMapping("/{id}")
    public BookResponse update(@PathVariable Long id, @Valid @RequestBody BookRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PostMapping("/{id}/decrease-stock")
    public BookResponse decrease(@PathVariable Long id, @RequestParam int quantity) {
        return service.decreaseStock(id, quantity);
    }

    @GetMapping("/{id}/qr")
    public String qr(@PathVariable Long id, @RequestParam(defaultValue = "http://localhost:5173") String baseUrl) {
        service.findById(id);
        String target = baseUrl + "/books/" + id;
        return "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=" + URLEncoder.encode(target, StandardCharsets.UTF_8);
    }
}
