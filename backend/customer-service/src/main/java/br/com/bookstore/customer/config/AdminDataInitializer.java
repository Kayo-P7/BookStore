package br.com.bookstore.customer.config;

import br.com.bookstore.customer.model.User;
import br.com.bookstore.customer.repository.UserRepository;
import br.com.bookstore.security.constant.SecurityRoles;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// inicializador para garantir a existencia de operadores padrao (admin e vendedor)
@Component
public class AdminDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminDataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String adminEmail = "admin@bookstore.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User(
                    "Administrador",
                    adminEmail,
                    passwordEncoder.encode("admin123"),
                    SecurityRoles.ROLE_ADMIN
            );
            userRepository.save(admin);
        }

        String sellerEmail = "vendedor@bookstore.com";
        if (!userRepository.existsByEmail(sellerEmail)) {
            User seller = new User(
                    "Vendedor Padrao",
                    sellerEmail,
                    passwordEncoder.encode("vendedor123"),
                    SecurityRoles.ROLE_SELLER
            );
            userRepository.save(seller);
        }
    }
}
