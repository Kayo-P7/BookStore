package br.com.bookstore.catalog.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.Map;

// servico de integracao externa com a api do google books
@Service
public class GoogleBooksService {
    private final RestClient client = RestClient.create("https://www.googleapis.com");

    // consulta volumes de livros na api externa a partir do termo informado
    public Map search(String q) {
        return client.get().uri("/books/v1/volumes?q={q}", q).retrieve().body(Map.class);
    }
}
