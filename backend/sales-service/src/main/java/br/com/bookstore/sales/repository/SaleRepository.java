package br.com.bookstore.sales.repository;

import br.com.bookstore.sales.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;

// repositorio de acesso a dados da entidade de vendas
public interface SaleRepository extends JpaRepository<Sale, Long> {
}
