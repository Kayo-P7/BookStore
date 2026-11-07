package br.com.bookstore.customer.config;

import br.com.bookstore.customer.model.Customer;
import br.com.bookstore.customer.repository.CustomerRepository;
import br.com.bookstore.security.constant.SecurityRoles;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// inicializador para garantir a existencia de um usuario administrador padrao
@Component
public class AdminDataInitializer implements CommandLineRunner {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminDataInitializer(CustomerRepository customerRepository, PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String adminEmail = "admin@bookstore.com";
        if (!customerRepository.existsByEmail(adminEmail)) {
            Customer admin = new Customer();
            admin.setName("Administrador");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(SecurityRoles.ROLE_ADMIN);
            admin.setPhone("11999999999");
            customerRepository.save(admin);
        }
    }
}
