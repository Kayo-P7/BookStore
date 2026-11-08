package br.com.bookstore.catalog.controller;

import br.com.bookstore.catalog.config.CatalogSecurityConfig;
import br.com.bookstore.catalog.dto.BookRequest;
import br.com.bookstore.catalog.dto.BookResponse;
import br.com.bookstore.catalog.service.BookService;
import br.com.bookstore.security.config.CommonSecurityConfig;
import br.com.bookstore.security.config.SecurityConfigTemplate;
import br.com.bookstore.security.config.SecurityProperties;
import br.com.bookstore.security.constant.SecurityRoles;
import br.com.bookstore.security.exception.CustomAccessDeniedHandler;
import br.com.bookstore.security.exception.CustomAuthenticationEntryPoint;
import br.com.bookstore.security.filter.JwtAuthenticationFilter;
import br.com.bookstore.security.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = BookController.class)
@TestPropertySource(properties = "CATALOG_SERVICE_PORT=8081")
@Import({
        CatalogSecurityConfig.class,
        CommonSecurityConfig.class,
        SecurityConfigTemplate.class,
        JwtAuthenticationFilter.class,
        CustomAuthenticationEntryPoint.class,
        CustomAccessDeniedHandler.class,
        JwtService.class,
        SecurityProperties.class
})
class BookControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BookService bookService;

    @Test
    @DisplayName("deve permitir listagem publica de livros sem autenticacao")
    void shouldAllowPublicAccessToCatalog() throws Exception {
        when(bookService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/catalog/books"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("deve negar criacao de livro sem autenticacao retornando 401")
    void shouldDenyBookCreationWithoutToken() throws Exception {
        BookRequest request = new BookRequest(
                "Clean Code", "Robert C. Martin", "9780132350884", "Prentice Hall",
                "Handbook of agile software", new BigDecimal("120.00"), 10
        );

        mockMvc.perform(post("/api/catalog/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("deve proibir criacao de livro por perfil VENDEDOR retornando 403")
    @WithMockUser(roles = SecurityRoles.SELLER)
    void shouldDenyBookCreationForSellerRole() throws Exception {
        BookRequest request = new BookRequest(
                "Clean Code", "Robert C. Martin", "9780132350884", "Prentice Hall",
                "Handbook of agile software", new BigDecimal("120.00"), 10
        );

        mockMvc.perform(post("/api/catalog/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("deve permitir criacao de livro quando usuario possuir papel ADMIN")
    @WithMockUser(roles = SecurityRoles.ADMIN)
    void shouldAllowBookCreationForAdminRole() throws Exception {
        BookRequest request = new BookRequest(
                "Clean Code", "Robert C. Martin", "9780132350884", "Prentice Hall",
                "Handbook of agile software", new BigDecimal("120.00"), 10
        );
        BookResponse response = new BookResponse(
                1L, "Clean Code", "Robert C. Martin", "9780132350884", "Prentice Hall",
                "Handbook of agile software", new BigDecimal("120.00"), 10
        );

        when(bookService.save(any(BookRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/catalog/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("deve permitir exclusao de livro quando usuario possuir papel ADMIN")
    @WithMockUser(roles = SecurityRoles.ADMIN)
    void shouldAllowBookDeletionForAdminRole() throws Exception {
        mockMvc.perform(delete("/api/catalog/books/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("deve proibir exclusao de livro por perfil VENDEDOR retornando 403")
    @WithMockUser(roles = SecurityRoles.SELLER)
    void shouldDenyBookDeletionForSellerRole() throws Exception {
        mockMvc.perform(delete("/api/catalog/books/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("deve permitir reducao de estoque para perfil VENDEDOR")
    @WithMockUser(roles = SecurityRoles.SELLER)
    void shouldAllowDecreaseStockForSeller() throws Exception {
        BookResponse response = new BookResponse(
                1L, "Clean Code", "Robert C. Martin", "9780132350884", "Prentice Hall",
                "Handbook of agile software", new BigDecimal("120.00"), 9
        );

        when(bookService.decreaseStock(eq(1L), eq(1))).thenReturn(response);

        mockMvc.perform(post("/api/catalog/books/1/decrease-stock?quantity=1"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("deve permitir reducao de estoque para perfil ADMIN")
    @WithMockUser(roles = SecurityRoles.ADMIN)
    void shouldAllowDecreaseStockForAdmin() throws Exception {
        BookResponse response = new BookResponse(
                1L, "Clean Code", "Robert C. Martin", "9780132350884", "Prentice Hall",
                "Handbook of agile software", new BigDecimal("120.00"), 8
        );

        when(bookService.decreaseStock(eq(1L), eq(2))).thenReturn(response);

        mockMvc.perform(post("/api/catalog/books/1/decrease-stock?quantity=2"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("deve negar reducao de estoque sem autenticacao retornando 401")
    void shouldDenyDecreaseStockWithoutAuthentication() throws Exception {
        mockMvc.perform(post("/api/catalog/books/1/decrease-stock?quantity=1"))
                .andExpect(status().isUnauthorized());
    }
}
