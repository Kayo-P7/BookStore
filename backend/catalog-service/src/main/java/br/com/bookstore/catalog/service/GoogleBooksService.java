package br.com.bookstore.catalog.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.Map;

@Service
public class GoogleBooksService {
    private final RestClient client = RestClient.create("https://www.googleapis.com");

    public Map search(String q) {
        return client.get().uri("/books/v1/volumes?q={q}", q).retrieve().body(Map.class);
    }
}
