package br.com.bookstore.customer.repository;

import br.com.bookstore.customer.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

// repositorio de acesso a dados da entidade de clientes
public interface CustomerRepository extends JpaRepository<Customer, Long> {
}
