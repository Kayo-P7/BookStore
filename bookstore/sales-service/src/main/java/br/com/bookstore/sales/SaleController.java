package br.com.bookstore.sales;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
@RestController @RequestMapping("/api/sales")
public class SaleController {
 private final SaleRepository repo;
 private final RestClient catalog;
 private final RestClient customers;
 public SaleController(SaleRepository repo,
   @org.springframework.beans.factory.annotation.Value("${services.catalog-url:http://localhost:8081}") String catalogUrl,
   @org.springframework.beans.factory.annotation.Value("${services.customer-url:http://localhost:8082}") String customerUrl){
  this.repo=repo;this.catalog=RestClient.create(catalogUrl);this.customers=RestClient.create(customerUrl);
 }
 @GetMapping public List<Sale> all(){return repo.findAll();}
 @PostMapping public Sale create(@RequestBody SaleRequest request){
  if(request.quantity()==null || request.quantity()<1) throw new IllegalArgumentException("Quantidade inválida");
  customers.get().uri("/api/customers/{id}",request.customerId()).retrieve().toBodilessEntity();
  Map book=catalog.get().uri("/api/catalog/books/{id}",request.bookId()).retrieve().body(Map.class);
  BigDecimal price=new BigDecimal(book.get("price").toString());
  catalog.post().uri("/api/catalog/books/{id}/decrease-stock?quantity={q}",request.bookId(),request.quantity()).retrieve().toBodilessEntity();
  return repo.save(new Sale(request.customerId(),request.bookId(),request.quantity(),price));
 }
 public record SaleRequest(Long customerId,Long bookId,Integer quantity){}
}
