package br.com.bookstore.customer.repository;

import br.com.bookstore.customer.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// repositorio de dados para operadores do sistema (usuarios)
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
