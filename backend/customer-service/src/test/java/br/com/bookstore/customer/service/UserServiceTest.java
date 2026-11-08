package br.com.bookstore.customer.service;

import br.com.bookstore.customer.dto.UserRequest;
import br.com.bookstore.customer.dto.UserResponse;
import br.com.bookstore.customer.dto.UserUpdateRequest;
import br.com.bookstore.customer.mapper.UserMapper;
import br.com.bookstore.customer.model.User;
import br.com.bookstore.customer.repository.UserRepository;
import br.com.bookstore.security.constant.SecurityRoles;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository repo;

    @Mock
    private UserMapper mapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService service;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Operador Teste", "operador@bookstore.com", "hash_senha", SecurityRoles.ROLE_SELLER);
        try {
            var idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(sampleUser, 1L);
        } catch (Exception ignored) {
        }
    }

    @Test
    @DisplayName("deve listar todos os operadores com sucesso")
    void shouldFindAllUsers() {
        when(repo.findAll()).thenReturn(List.of(sampleUser));
        when(mapper.toResponseList(any())).thenReturn(List.of(
                new UserResponse(1L, "Operador Teste", "operador@bookstore.com", SecurityRoles.ROLE_SELLER, true, Instant.now(), Instant.now())
        ));

        List<UserResponse> list = service.findAll();

        assertEquals(1, list.size());
        assertEquals("operador@bookstore.com", list.getFirst().email());
    }

    @Test
    @DisplayName("deve criar novo operador criptografando senha e normalizando papel")
    void shouldCreateUserSuccessfully() {
        UserRequest request = new UserRequest("Novo Vendedor", "novo@bookstore.com", "senha123", "SELLER");
        User userEntity = new User();
        userEntity.setName(request.name());
        userEntity.setEmail(request.email());

        when(repo.existsByEmail(request.email())).thenReturn(false);
        when(mapper.toEntity(request)).thenReturn(userEntity);
        when(passwordEncoder.encode("senha123")).thenReturn("encoded_senha123");
        when(repo.save(any(User.class))).thenReturn(userEntity);
        when(mapper.toResponse(any())).thenReturn(
                new UserResponse(2L, "Novo Vendedor", "novo@bookstore.com", SecurityRoles.ROLE_SELLER, true, Instant.now(), Instant.now())
        );

        UserResponse response = service.create(request);

        assertNotNull(response);
        assertEquals("novo@bookstore.com", response.email());
        verify(passwordEncoder).encode("senha123");
        verify(repo).save(userEntity);
    }

    @Test
    @DisplayName("deve lancar excecao ao tentar criar operador com email ja existente")
    void shouldThrowExceptionWhenCreatingDuplicateEmail() {
        UserRequest request = new UserRequest("Novo", "existe@bookstore.com", "senha123", "SELLER");
        when(repo.existsByEmail(request.email())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> service.create(request));
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("deve atualizar operador existente alterando dados e senha opcional")
    void shouldUpdateUserSuccessfully() {
        UserUpdateRequest request = new UserUpdateRequest("Nome Atualizado", "operador@bookstore.com", "novaSenha123", "ADMIN", true);

        when(repo.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.encode("novaSenha123")).thenReturn("encoded_nova_senha");
        when(repo.save(any(User.class))).thenReturn(sampleUser);
        when(mapper.toResponse(any())).thenReturn(
                new UserResponse(1L, "Nome Atualizado", "operador@bookstore.com", SecurityRoles.ROLE_ADMIN, true, Instant.now(), Instant.now())
        );

        UserResponse response = service.update(1L, request);

        assertNotNull(response);
        assertEquals(SecurityRoles.ROLE_ADMIN, response.role());
        verify(passwordEncoder).encode("novaSenha123");
    }

    @Test
    @DisplayName("deve excluir operador por id com sucesso")
    void shouldDeleteUserSuccessfully() {
        when(repo.findById(1L)).thenReturn(Optional.of(sampleUser));

        service.delete(1L);

        verify(repo).delete(sampleUser);
    }
}
