package br.com.bookstore.catalog.repository;

import br.com.bookstore.catalog.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

// repositorio de acesso a dados da entidade de livros
public interface BookRepository extends JpaRepository<Book, Long> {

    // busca livros pelo titulo ignorando maiusculas e minusculas
    List<Book> findByTitleContainingIgnoreCase(String title);

    // verifica se existe livro cadastrado com o isbn informado
    boolean existsByIsbn(String isbn);

    // busca livro pelo isbn
    Optional<Book> findByIsbn(String isbn);

    // abate estoque atomicamente no banco evitando lost update sob concorrencia
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Book b SET b.stock = b.stock - :quantity WHERE b.id = :id AND b.stock >= :quantity")
    int decrementStockIfAvailable(@Param("id") Long id, @Param("quantity") int quantity);
}
