package br.com.bookstore.sales.controller;

import br.com.bookstore.sales.config.SalesSecurityConfig;
import br.com.bookstore.sales.dto.SaleRequest;
import br.com.bookstore.sales.dto.SaleResponse;
import br.com.bookstore.sales.service.SaleService;
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
import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = SaleController.class)
@TestPropertySource(properties = {
        "SALES_SERVICE_PORT=8083",
        "CATALOG_URL=http://localhost:8081",
        "CUSTOMER_URL=http://localhost:8082"
})
@Import({
        SalesSecurityConfig.class,
        CommonSecurityConfig.class,
        SecurityConfigTemplate.class,
        JwtAuthenticationFilter.class,
        CustomAuthenticationEntryPoint.class,
        CustomAccessDeniedHandler.class,
        JwtService.class,
        SecurityProperties.class
})
class SaleControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private SaleService saleService;

    @Test
    @DisplayName("deve negar listagem de vendas sem autenticacao retornando 401")
    void shouldDenySalesListingWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/sales"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("deve permitir listagem de vendas para usuario autenticado")
    @WithMockUser(roles = SecurityRoles.CUSTOMER)
    void shouldAllowSalesListingForAuthenticatedUser() throws Exception {
        when(saleService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/sales"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("deve negar criacao de venda sem token retornando 401")
    void shouldDenySaleCreationWithoutToken() throws Exception {
        SaleRequest request = new SaleRequest(1L, 2L, 1);

        mockMvc.perform(post("/api/sales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("deve permitir criacao de venda para cliente autenticado com papel CUSTOMER")
    @WithMockUser(roles = SecurityRoles.CUSTOMER)
    void shouldAllowSaleCreationForCustomerRole() throws Exception {
        SaleRequest request = new SaleRequest(1L, 2L, 1);
        SaleResponse response = new SaleResponse(
                10L, 1L, 2L, 1, new BigDecimal("100.00"), new BigDecimal("100.00"), Instant.now()
        );

        when(saleService.create(any(SaleRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/sales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("deve permitir criacao de venda para usuario com papel ADMIN")
    @WithMockUser(roles = SecurityRoles.ADMIN)
    void shouldAllowSaleCreationForAdminRole() throws Exception {
        SaleRequest request = new SaleRequest(1L, 2L, 1);
        SaleResponse response = new SaleResponse(
                11L, 1L, 2L, 1, new BigDecimal("100.00"), new BigDecimal("100.00"), Instant.now()
        );

        when(saleService.create(any(SaleRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/sales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}
