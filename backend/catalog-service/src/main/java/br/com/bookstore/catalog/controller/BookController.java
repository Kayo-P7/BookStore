package br.com.bookstore.catalog.controller;

import br.com.bookstore.catalog.dto.BookRequest;
import br.com.bookstore.catalog.dto.BookResponse;
import br.com.bookstore.catalog.service.BookService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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

    // lista livros com suporte opcional a paginacao mantendo compatibilidade retroativa
    @GetMapping
    public List<BookResponse> all(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            HttpServletResponse response
    ) {
        if (page == null && size == null) {
            return service.findAll();
        }
        Page<BookResponse> result = service.findPage(
                PageRequest.of(Math.max(page != null ? page : 0, 0), Math.clamp(size != null ? size : 20, 1, 200), Sort.by("id").descending())
        );
        response.setHeader("X-Total-Count", String.valueOf(result.getTotalElements()));
        return result.getContent();
    }

    // retorna envelope paginado completo para clientes com paginacao no servidor
    @GetMapping("/paged")
    public Page<BookResponse> paged(@PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return service.findPage(pageable);
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

    // cria novo registro de livro (vendedor e administrador)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public BookResponse create(@Valid @RequestBody BookRequest request) {
        return service.save(request);
    }

    // altera dados de um livro existente (vendedor e administrador)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public BookResponse update(@PathVariable Long id, @Valid @RequestBody BookRequest request) {
        return service.update(id, request);
    }

    // exclui registro de livro por id (exclusivo para administrador)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // reduz a quantidade em estoque de um livro (vendedor e administrador)
    @PostMapping("/{id}/decrease-stock")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
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
