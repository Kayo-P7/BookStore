package br.com.bookstore.catalog.controller;

import br.com.bookstore.catalog.dto.BookRequest;
import br.com.bookstore.catalog.dto.BookResponse;
import br.com.bookstore.catalog.service.BookService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

// controlador rest para exposicao de operacoes sobre livros
@RestController
@RequestMapping("/api/catalog/books")
public class BookController {

    private final BookService service;

    public BookController(BookService service) {
        this.service = service;
    }

    // lista todos os livros disponiveis
    @GetMapping
    public List<BookResponse> all() {
        return service.findAll();
    }

    // busca dados de um livro especifico por id
    @GetMapping("/{id}")
    public BookResponse one(@PathVariable Long id) {
        return service.findById(id);
    }

    // pesquisa livros por filtro de titulo
    @GetMapping("/search")
    public List<BookResponse> search(@RequestParam String title) {
        return service.search(title);
    }

    // cria novo registro de livro
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookResponse create(@Valid @RequestBody BookRequest request) {
        return service.save(request);
    }

    // altera dados de um livro existente
    @PutMapping("/{id}")
    public BookResponse update(@PathVariable Long id, @Valid @RequestBody BookRequest request) {
        return service.update(id, request);
    }

    // exclui registro de livro por id
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // reduz a quantidade em estoque de um livro
    @PostMapping("/{id}/decrease-stock")
    public BookResponse decrease(@PathVariable Long id, @RequestParam int quantity) {
        return service.decreaseStock(id, quantity);
    }

    // gera url com imagem de qr code para acesso ao livro
    @GetMapping("/{id}/qr")
    public String qr(@PathVariable Long id, @RequestParam(defaultValue = "http://localhost:5173") String baseUrl) {
        service.findById(id);
        String target = baseUrl + "/books/" + id;
        return "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=" + URLEncoder.encode(target, StandardCharsets.UTF_8);
    }
}
