package br.com.bookstore.catalog.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.*;

// servico de integracao externa com a api do google books com fallback resiliente
@Service
public class GoogleBooksService {
    private final RestClient googleClient = RestClient.create("https://www.googleapis.com");
    private final RestClient openLibraryClient = RestClient.create("https://openlibrary.org");

    @Value("${google.books.api.key:}")
    private String apiKey;

    // consulta volumes de livros na api externa a partir do termo informado com resiliencia
    public Map search(String q) {
        if (q == null || q.trim().isEmpty()) {
            return Map.of("items", List.of(), "totalItems", 0);
        }

        try {
            String uri = (apiKey != null && !apiKey.isBlank())
                    ? "/books/v1/volumes?q={q}&key={key}"
                    : "/books/v1/volumes?q={q}";

            Map response;
            if (apiKey != null && !apiKey.isBlank()) {
                response = googleClient.get().uri(uri, q.trim(), apiKey.trim()).retrieve().body(Map.class);
            } else {
                response = googleClient.get().uri(uri, q.trim()).retrieve().body(Map.class);
            }

            if (response != null && response.containsKey("items")) {
                return response;
            }
        } catch (Exception e) {
            // em caso de cota de ip excedida (429) ou erro externo, utiliza fallback para open library
        }

        return searchOpenLibraryFallback(q.trim());
    }

    @SuppressWarnings("unchecked")
    private Map searchOpenLibraryFallback(String q) {
        try {
            Map olResponse = openLibraryClient.get()
                    .uri("/search.json?q={q}&limit=8", q)
                    .retrieve()
                    .body(Map.class);

            if (olResponse != null && olResponse.get("docs") instanceof List<?> docs) {
                List<Map<String, Object>> items = new ArrayList<>();
                for (Object itemObj : docs) {
                    if (itemObj instanceof Map<?, ?> doc) {
                        Map<String, Object> volumeInfo = new HashMap<>();
                        volumeInfo.put("title", doc.get("title"));

                        if (doc.get("author_name") instanceof List<?> authors) {
                            volumeInfo.put("authors", authors);
                        }
                        if (doc.get("publisher") instanceof List<?> pubs && !pubs.isEmpty()) {
                            volumeInfo.put("publisher", pubs.get(0));
                        }
                        if (doc.get("first_publish_year") != null) {
                            volumeInfo.put("publishedDate", String.valueOf(doc.get("first_publish_year")));
                        }
                        if (doc.get("isbn") instanceof List<?> isbns && !isbns.isEmpty()) {
                            List<Map<String, String>> identifiers = new ArrayList<>();
                            identifiers.add(Map.of("type", "ISBN_13", "identifier", String.valueOf(isbns.get(0))));
                            volumeInfo.put("industryIdentifiers", identifiers);
                        }
                        if (doc.get("cover_i") != null) {
                            String coverId = String.valueOf(doc.get("cover_i"));
                            volumeInfo.put("imageLinks", Map.of(
                                    "smallThumbnail", "https://covers.openlibrary.org/b/id/" + coverId + "-S.jpg",
                                    "thumbnail", "https://covers.openlibrary.org/b/id/" + coverId + "-M.jpg"
                            ));
                        }

                        Map<String, Object> item = new HashMap<>();
                        item.put("id", doc.get("key"));
                        item.put("volumeInfo", volumeInfo);
                        items.add(item);
                    }
                }
                return Map.of("items", items, "totalItems", items.size());
            }
        } catch (Exception ignored) {
        }

        return Map.of("items", List.of(), "totalItems", 0);
    }
}
