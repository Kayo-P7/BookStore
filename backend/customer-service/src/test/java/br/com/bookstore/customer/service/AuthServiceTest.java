package br.com.bookstore.customer.service;

import br.com.bookstore.customer.dto.AuthResponse;
import br.com.bookstore.customer.dto.LoginRequest;
import br.com.bookstore.customer.dto.RegisterRequest;
import br.com.bookstore.customer.model.User;
import br.com.bookstore.customer.repository.UserRepository;
import br.com.bookstore.customer.security.SystemUserDetails;
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

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Victor Operador", "victor@bookstore.com", "encoded_secret", SecurityRoles.ROLE_SELLER);
        try {
            var idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(sampleUser, 1L);
        } catch (Exception ignored) {
        }
    }

    @Test
    @DisplayName("deve registrar novo operador e retornar tokens com sucesso")
    void shouldRegisterNewUserSuccessfully() {
        RegisterRequest request = new RegisterRequest(
                "Victor Operador",
                "victor@bookstore.com",
                "senha123",
                SecurityRoles.SELLER
        );

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("encoded_secret");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateToken(anyString(), anyCollection(), anyMap())).thenReturn("mocked-access-token");
        when(jwtService.generateRefreshToken(anyString())).thenReturn("mocked-refresh-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mocked-access-token", response.accessToken());
        assertEquals("mocked-refresh-token", response.refreshToken());
        assertEquals("victor@bookstore.com", response.email());
        assertEquals(SecurityRoles.ROLE_SELLER, response.role());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("deve lancar excecao ao tentar registrar email duplicado")
    void shouldThrowExceptionWhenRegisteringDuplicateEmail() {
        RegisterRequest request = new RegisterRequest(
                "Victor Operador",
                "duplicado@bookstore.com",
                "senha123",
                null
        );

        when(userRepository.existsByEmail("duplicado@bookstore.com")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        assertTrue(ex.getMessage().contains("E-mail ja cadastrado"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("deve autenticar credenciais no login e retornar tokens de operador")
    void shouldLoginSuccessfully() {
        LoginRequest request = new LoginRequest("victor@bookstore.com", "senha123");
        SystemUserDetails userDetails = new SystemUserDetails(sampleUser);
        UsernamePasswordAuthenticationToken authenticatedToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authenticatedToken);
        when(jwtService.generateToken(eq(sampleUser.getEmail()), anyCollection(), anyMap()))
                .thenReturn("mocked-access-token");
        when(jwtService.generateRefreshToken(sampleUser.getEmail()))
                .thenReturn("mocked-refresh-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked-access-token", response.accessToken());
        assertEquals("victor@bookstore.com", response.email());
        assertEquals(SecurityRoles.ROLE_SELLER, response.role());
    }

    @Test
    @DisplayName("deve alterar senha de operador com sucesso no primeiro acesso")
    void shouldChangePasswordSuccessfully() {
        sampleUser.setMustChangePassword(true);
        var request = new br.com.bookstore.customer.dto.ChangePasswordRequest(
                "victor@bookstore.com",
                "senha123",
                "NovaSenha@2026"
        );

        when(userRepository.findByEmail("victor@bookstore.com")).thenReturn(java.util.Optional.of(sampleUser));
        when(passwordEncoder.matches("senha123", "encoded_secret")).thenReturn(true);
        when(passwordEncoder.matches("NovaSenha@2026", "encoded_secret")).thenReturn(false);
        when(passwordEncoder.encode("NovaSenha@2026")).thenReturn("new_encoded_secret");
        when(jwtService.generateToken(eq(sampleUser.getEmail()), anyCollection(), anyMap()))
                .thenReturn("new-access-token");
        when(jwtService.generateRefreshToken(sampleUser.getEmail()))
                .thenReturn("new-refresh-token");

        AuthResponse response = authService.changePassword(null, request);

        assertNotNull(response);
        assertEquals("new-access-token", response.accessToken());
        assertFalse(response.mustChangePassword());
        assertFalse(sampleUser.isMustChangePassword());
        verify(userRepository).save(sampleUser);
    }
}
