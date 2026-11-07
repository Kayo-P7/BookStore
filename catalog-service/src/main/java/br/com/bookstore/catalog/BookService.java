package br.com.bookstore.catalog;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service
public class BookService {
 private final BookRepository repo;
 public BookService(BookRepository repo){this.repo=repo;}
 public List<Book> findAll(){return repo.findAll();}
 public Book findById(Long id){return repo.findById(id).orElseThrow(()->new IllegalArgumentException("Livro não encontrado: "+id));}
 public List<Book> search(String title){return repo.findByTitleContainingIgnoreCase(title);}
 public Book save(Book book){return repo.save(book);}
 public void delete(Long id){repo.delete(findById(id));}
 @Transactional public Book decreaseStock(Long id,int quantity){
  if(quantity<=0) throw new IllegalArgumentException("Quantidade deve ser positiva");
  Book b=findById(id);
  if(b.getStock()==null || b.getStock()<quantity) throw new IllegalStateException("Estoque insuficiente");
  b.setStock(b.getStock()-quantity); return repo.save(b);
 }
}
