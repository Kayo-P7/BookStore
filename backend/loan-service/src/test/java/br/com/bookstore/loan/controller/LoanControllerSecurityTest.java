package br.com.bookstore.loan.controller;

import br.com.bookstore.loan.config.LoanSecurityConfig;
import br.com.bookstore.loan.dto.BookLoanInventoryRequestDTO;
import br.com.bookstore.loan.dto.BookLoanInventoryResponseDTO;
import br.com.bookstore.loan.dto.LoanRequestDTO;
import br.com.bookstore.loan.dto.LoanResponseDTO;
import br.com.bookstore.loan.exception.BusinessConflictException;
import br.com.bookstore.loan.exception.GlobalExceptionHandler;
import br.com.bookstore.loan.model.LoanStatus;
import br.com.bookstore.loan.service.LoanService;
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

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = LoanController.class)
@TestPropertySource(properties = {
        "LOAN_SERVICE_PORT=8085",
        "CATALOG_URL=http://localhost:8081",
        "CUSTOMER_URL=http://localhost:8082"
})
@Import({
        LoanSecurityConfig.class,
        GlobalExceptionHandler.class,
        CommonSecurityConfig.class,
        SecurityConfigTemplate.class,
        JwtAuthenticationFilter.class,
        CustomAuthenticationEntryPoint.class,
        CustomAccessDeniedHandler.class,
        JwtService.class,
        SecurityProperties.class
})
class LoanControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private LoanService loanService;

    @Test
    @DisplayName("deve negar listagem de emprestimos sem autenticacao retornando 401")
    void shouldDenyLoansWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/loans"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("deve permitir listagem de emprestimos e inventario para SELLER")
    @WithMockUser(roles = SecurityRoles.SELLER)
    void shouldAllowListingForSeller() throws Exception {
        when(loanService.findAllLoans()).thenReturn(List.of());
        when(loanService.findAllInventories()).thenReturn(List.of());

        mockMvc.perform(get("/api/loans"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/loans/inventory"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("deve negar cadastro manual de inventario para SELLER retornando 403")
    @WithMockUser(roles = SecurityRoles.SELLER)
    void shouldForbidInventoryCreationForSeller() throws Exception {
        BookLoanInventoryRequestDTO request = new BookLoanInventoryRequestDTO(1L, 5);

        mockMvc.perform(post("/api/loans/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("deve permitir cadastro de inventario para ADMIN retornando 201")
    @WithMockUser(roles = SecurityRoles.ADMIN)
    void shouldAllowInventoryCreationForAdmin() throws Exception {
        BookLoanInventoryRequestDTO request = new BookLoanInventoryRequestDTO(1L, 5);
        when(loanService.registerInventory(any())).thenReturn(new BookLoanInventoryResponseDTO(1L, 1L, 5, 5, 0));

        mockMvc.perform(post("/api/loans/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("deve permitir criacao e devolucao de emprestimo para SELLER")
    @WithMockUser(roles = SecurityRoles.SELLER)
    void shouldAllowCreateAndReturnLoanForSeller() throws Exception {
        LocalDate today = LocalDate.now();
        LoanRequestDTO request = new LoanRequestDTO(1L, 2L, today.plusDays(7));
        LoanResponseDTO created = new LoanResponseDTO(1L, 1L, 2L, today, today.plusDays(7), null, LoanStatus.ACTIVE);
        LoanResponseDTO returned = new LoanResponseDTO(1L, 1L, 2L, today, today.plusDays(7), today, LoanStatus.RETURNED);

        when(loanService.createLoan(any())).thenReturn(created);
        when(loanService.returnLoan(1L)).thenReturn(returned);

        mockMvc.perform(post("/api/loans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(put("/api/loans/1/return"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("deve retornar 409 com ProblemDetail em conflito de negocio")
    @WithMockUser(roles = SecurityRoles.ADMIN)
    void shouldReturnConflictProblemDetail() throws Exception {
        LoanRequestDTO request = new LoanRequestDTO(1L, 2L, LocalDate.now().plusDays(7));
        when(loanService.createLoan(any())).thenThrow(new BusinessConflictException("No copies available for loan"));

        mockMvc.perform(post("/api/loans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("No copies available for loan"));
    }
}
