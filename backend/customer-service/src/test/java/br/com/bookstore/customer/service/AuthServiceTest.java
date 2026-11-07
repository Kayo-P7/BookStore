package br.com.bookstore.customer.service;

import br.com.bookstore.customer.dto.AuthResponse;
import br.com.bookstore.customer.dto.LoginRequest;
import br.com.bookstore.customer.dto.RegisterRequest;
import br.com.bookstore.customer.model.Customer;
import br.com.bookstore.customer.repository.CustomerRepository;
import br.com.bookstore.customer.security.CustomerUserDetails;
import br.com.bookstore.security.constant.SecurityRoles;
import br.com.bookstore.security.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private Customer sampleCustomer;

    @BeforeEach
    void setUp() {
        sampleCustomer = new Customer();
        sampleCustomer.setName("Victor Teste");
        sampleCustomer.setEmail("victor@bookstore.com");
        sampleCustomer.setPassword("encoded_secret");
        sampleCustomer.setRole(SecurityRoles.ROLE_CUSTOMER);
        try {
            var idField = Customer.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(sampleCustomer, 1L);
        } catch (Exception ignored) {
        }
    }

    @Test
    @DisplayName("deve registrar novo usuario e retornar tokens com sucesso")
    void shouldRegisterNewUserSuccessfully() {
        RegisterRequest request = new RegisterRequest(
                "Victor Teste",
                "victor@bookstore.com",
                "senha123",
                "11988888888",
                "01001000",
                "Praca da Se",
                "Se",
                "Sao Paulo",
                "SP"
        );

        when(customerRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("encoded_secret");
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> {
            Customer c = invocation.getArgument(0);
            return c;
        });
        when(jwtService.generateToken(anyString(), anyCollection(), anyMap())).thenReturn("mocked-access-token");
        when(jwtService.generateRefreshToken(anyString())).thenReturn("mocked-refresh-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mocked-access-token", response.accessToken());
        assertEquals("mocked-refresh-token", response.refreshToken());
        assertEquals("victor@bookstore.com", response.email());
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    @DisplayName("deve lancar excecao ao tentar registrar email duplicado")
    void shouldThrowExceptionWhenRegisteringDuplicateEmail() {
        RegisterRequest request = new RegisterRequest(
                "Victor Teste",
                "duplicado@bookstore.com",
                "senha123",
                null, null, null, null, null, null
        );

        when(customerRepository.existsByEmail("duplicado@bookstore.com")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        assertTrue(ex.getMessage().contains("E-mail ja cadastrado"));
        verify(customerRepository, never()).save(any());
    }

    @Test
    @DisplayName("deve autenticar credenciais no login e retornar tokens")
    void shouldLoginSuccessfully() {
        LoginRequest request = new LoginRequest("victor@bookstore.com", "senha123");
        CustomerUserDetails userDetails = new CustomerUserDetails(sampleCustomer);
        UsernamePasswordAuthenticationToken authenticatedToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authenticatedToken);
        when(jwtService.generateToken(eq(sampleCustomer.getEmail()), anyCollection(), anyMap()))
                .thenReturn("mocked-access-token");
        when(jwtService.generateRefreshToken(sampleCustomer.getEmail()))
                .thenReturn("mocked-refresh-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked-access-token", response.accessToken());
        assertEquals("victor@bookstore.com", response.email());
    }
}
