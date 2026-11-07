package br.com.bookstore.customer.controller;

import br.com.bookstore.customer.config.CustomerSecurityConfig;
import br.com.bookstore.customer.dto.UserRequest;
import br.com.bookstore.customer.dto.UserResponse;
import br.com.bookstore.customer.service.UserService;
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

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = UserController.class)
@TestPropertySource(properties = {
        "CUSTOMER_SERVICE_PORT=8082"
})
@Import({
        CustomerSecurityConfig.class,
        CommonSecurityConfig.class,
        SecurityConfigTemplate.class,
        JwtAuthenticationFilter.class,
        CustomAuthenticationEntryPoint.class,
        CustomAccessDeniedHandler.class,
        JwtService.class,
        SecurityProperties.class
})
class UserControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @Test
    @DisplayName("deve negar listagem de usuarios sem autenticacao retornando 401")
    void shouldDenyListingWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("deve negar acesso a usuarios para perfil VENDEDOR retornando 403")
    @WithMockUser(roles = SecurityRoles.SELLER)
    void shouldDenyUserAccessForSellerRole() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("deve permitir listagem de usuarios para perfil ADMIN retornando 200")
    @WithMockUser(roles = SecurityRoles.ADMIN)
    void shouldAllowUserListingForAdminRole() throws Exception {
        when(userService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("deve negar cadastro de usuario para perfil VENDEDOR retornando 403")
    @WithMockUser(roles = SecurityRoles.SELLER)
    void shouldDenyUserCreationForSellerRole() throws Exception {
        UserRequest request = new UserRequest("Novo Operador", "novo@bookstore.com", "senha123", SecurityRoles.SELLER);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("deve permitir cadastro de usuario para perfil ADMIN retornando 201")
    @WithMockUser(roles = SecurityRoles.ADMIN)
    void shouldAllowUserCreationForAdminRole() throws Exception {
        UserRequest request = new UserRequest("Novo Operador", "novo@bookstore.com", "senha123", SecurityRoles.SELLER);
        UserResponse response = new UserResponse(
                2L, "Novo Operador", "novo@bookstore.com", SecurityRoles.ROLE_SELLER, true, Instant.now()
        );

        when(userService.create(any(UserRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("deve negar exclusao de usuario para perfil VENDEDOR retornando 403")
    @WithMockUser(roles = SecurityRoles.SELLER)
    void shouldDenyUserDeletionForSellerRole() throws Exception {
        mockMvc.perform(delete("/api/users/2"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("deve permitir exclusao de usuario para perfil ADMIN retornando 204")
    @WithMockUser(roles = SecurityRoles.ADMIN)
    void shouldAllowUserDeletionForAdminRole() throws Exception {
        mockMvc.perform(delete("/api/users/2"))
                .andExpect(status().isNoContent());
    }
}
