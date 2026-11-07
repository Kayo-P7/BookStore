package br.com.bookstore.catalog;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
@RestController @RequestMapping("/api/catalog/books")
public class BookController {
 private final BookService service;
 public BookController(BookService service){this.service=service;}
 @GetMapping public List<Book> all(){return service.findAll();}
 @GetMapping("/{id}") public Book one(@PathVariable Long id){return service.findById(id);}
 @GetMapping("/search") public List<Book> search(@RequestParam String title){return service.search(title);}
 @PostMapping public Book create(@Valid @RequestBody Book book){return service.save(book);}
 @PutMapping("/{id}") public Book update(@PathVariable Long id,@Valid @RequestBody Book input){
  Book b=service.findById(id); b.setTitle(input.getTitle());b.setAuthors(input.getAuthors());b.setIsbn(input.getIsbn());
  b.setPublisher(input.getPublisher());b.setDescription(input.getDescription());b.setPrice(input.getPrice());b.setStock(input.getStock());return service.save(b);
 }
 @DeleteMapping("/{id}") public void delete(@PathVariable Long id){service.delete(id);}
 @PostMapping("/{id}/decrease-stock") public Book decrease(@PathVariable Long id,@RequestParam int quantity){return service.decreaseStock(id,quantity);}
 @GetMapping("/{id}/qr") public String qr(@PathVariable Long id,@RequestParam(defaultValue="http://localhost:5173") String baseUrl){
  service.findById(id); String target=baseUrl+"/books/"+id;
  return "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data="+URLEncoder.encode(target, StandardCharsets.UTF_8);
 }
}
