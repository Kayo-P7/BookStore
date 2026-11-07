package br.com.bookstore.customer.controller;

import br.com.bookstore.customer.config.CustomerSecurityConfig;
import br.com.bookstore.customer.dto.CustomerRequest;
import br.com.bookstore.customer.dto.CustomerResponse;
import br.com.bookstore.customer.service.CustomerService;
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

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CustomerController.class)
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
class CustomerControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CustomerService customerService;

    @Test
    @DisplayName("deve permitir consulta de cep publicamente sem autenticacao retornando 200")
    void shouldAllowCepLookupPublicly() throws Exception {
        when(customerService.findCep("01001000")).thenReturn(Map.of("cep", "01001-000", "logradouro", "Praca da Se"));

        mockMvc.perform(get("/api/customers/cep/01001000"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("deve negar listagem de clientes sem autenticacao retornando 401")
    void shouldDenyListingWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("deve permitir listagem de clientes para vendedor com papel SELLER")
    @WithMockUser(roles = SecurityRoles.SELLER)
    void shouldAllowListingForSeller() throws Exception {
        when(customerService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("deve permitir listagem de clientes para administrador com papel ADMIN")
    @WithMockUser(roles = SecurityRoles.ADMIN)
    void shouldAllowListingForAdmin() throws Exception {
        when(customerService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("deve negar criacao de cliente sem autenticacao retornando 401")
    void shouldDenyCreationWithoutAuthentication() throws Exception {
        CustomerRequest request = new CustomerRequest("Cliente Teste", "cliente@teste.com", null, null, null, null, null, null);

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("deve permitir criacao de cliente para vendedor com papel SELLER retornando 201")
    @WithMockUser(roles = SecurityRoles.SELLER)
    void shouldAllowCreationForSeller() throws Exception {
        CustomerRequest request = new CustomerRequest("Cliente Teste", "cliente@teste.com", null, null, null, null, null, null);
        CustomerResponse response = new CustomerResponse(1L, "Cliente Teste", "cliente@teste.com", null, null, null, null, null, null);

        when(customerService.save(any(CustomerRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("deve permitir alteracao de cliente para vendedor com papel SELLER")
    @WithMockUser(roles = SecurityRoles.SELLER)
    void shouldAllowUpdateForSeller() throws Exception {
        CustomerRequest request = new CustomerRequest("Cliente Atualizado", "cliente@teste.com", null, null, null, null, null, null);
        CustomerResponse response = new CustomerResponse(1L, "Cliente Atualizado", "cliente@teste.com", null, null, null, null, null, null);

        when(customerService.update(eq(1L), any(CustomerRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/customers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("deve negar exclusao de cliente sem autenticacao retornando 401")
    void shouldDenyDeletionWithoutAuthentication() throws Exception {
        mockMvc.perform(delete("/api/customers/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("deve proibir exclusao de cliente para vendedor com papel SELLER retornando 403")
    @WithMockUser(roles = SecurityRoles.SELLER)
    void shouldForbidDeletionForSeller() throws Exception {
        mockMvc.perform(delete("/api/customers/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("deve permitir exclusao de cliente para administrador com papel ADMIN retornando 204")
    @WithMockUser(roles = SecurityRoles.ADMIN)
    void shouldAllowDeletionForAdmin() throws Exception {
        doNothing().when(customerService).delete(1L);

        mockMvc.perform(delete("/api/customers/1"))
                .andExpect(status().isNoContent());
    }
}
