package br.com.bookstore.catalog.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

// servico de integracao externa com a api do google books com fallback resiliente
@Service
public class GoogleBooksService {

    private static final int MAX_CACHE_ENTRIES = 256;
    private static final long CACHE_TTL_MS = Duration.ofMinutes(30).toMillis();

    private record CacheEntry(Map<?, ?> value, long expiresAt) {}

    // shortcut: cache local ate 256 termos por instancia, migrar para redis se escalar multiplas replicas
    private final ConcurrentHashMap<String, CacheEntry> searchCache = new ConcurrentHashMap<>();
    private final RestClient googleClient = buildExternalClient("https://www.googleapis.com");
    private final RestClient openLibraryClient = buildExternalClient("https://openlibrary.org");

    @Value("${google.books.api.key:}")
    private String apiKey;

    private static RestClient buildExternalClient(String baseUrl) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(2))
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofSeconds(4));
        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }

    // consulta volumes de livros na api externa a partir do termo informado com cache e resiliencia
    public Map search(String q) {
        if (q == null || q.trim().isEmpty()) {
            return Map.of("items", List.of(), "totalItems", 0);
        }

        String normalizedKey = q.trim().toLowerCase(Locale.ROOT);
        long now = System.currentTimeMillis();
        CacheEntry cached = searchCache.get(normalizedKey);
        if (cached != null && cached.expiresAt() > now) {
            return cached.value();
        }

        Map result = null;
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
                result = response;
            }
        } catch (Exception e) {
            // em caso de cota de ip excedida (429) ou erro externo, utiliza fallback para open library
        }

        if (result == null) {
            result = searchOpenLibraryFallback(q.trim());
        }

        if (result.get("items") instanceof List<?> list && !list.isEmpty()) {
            if (searchCache.size() >= MAX_CACHE_ENTRIES) {
                searchCache.entrySet().removeIf(entry -> entry.getValue().expiresAt() <= now);
                if (searchCache.size() >= MAX_CACHE_ENTRIES) {
                    searchCache.clear();
                }
            }
            searchCache.put(normalizedKey, new CacheEntry(result, now + CACHE_TTL_MS));
        }

        return result;
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
