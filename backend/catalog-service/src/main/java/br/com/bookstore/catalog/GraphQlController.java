package br.com.bookstore.catalog;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;
import java.math.BigDecimal;
import java.util.List;
@Controller
public class GraphQlController {
 private final BookService service;
 public GraphQlController(BookService service){this.service=service;}
 @QueryMapping public List<Book> books(){return service.findAll();}
 @QueryMapping public List<Book> searchBooks(@Argument String title){return service.search(title);}
 @QueryMapping public Book book(@Argument Long id){return service.findById(id);}
 @MutationMapping public Book createBook(@Argument String title,@Argument String authors,@Argument String isbn,
   @Argument String publisher,@Argument String description,@Argument BigDecimal price,@Argument Integer stock){
  return service.save(new Book(title,authors,isbn,publisher,description,price,stock));
 }
}
