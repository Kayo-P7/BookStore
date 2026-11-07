package br.com.bookstore.catalog;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import java.util.Map;
@RestController @RequestMapping("/api/integrations/google-books")
public class ExternalBooksController {
 private final RestClient client=RestClient.create("https://www.googleapis.com");
 @GetMapping public Map search(@RequestParam String q){
  return client.get().uri("/books/v1/volumes?q={q}",q).retrieve().body(Map.class);
 }
}
