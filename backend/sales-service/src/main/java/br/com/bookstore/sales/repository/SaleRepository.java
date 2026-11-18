package br.com.bookstore.sales.repository;

import br.com.bookstore.sales.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

// repositorio de acesso a dados da entidade de vendas
public interface SaleRepository extends JpaRepository<Sale, Long> {

    @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s")
    BigDecimal sumTotalRevenue();

    List<Sale> findTop6ByOrderByIdDesc();
}
