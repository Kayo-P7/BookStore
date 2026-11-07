package br.com.bookstore.catalog.repository;

import br.com.bookstore.catalog.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// repositorio de acesso a dados da entidade de livros
public interface BookRepository extends JpaRepository<Book, Long> {
    // busca livros pelo titulo ignorando maiusculas e minusculas
    List<Book> findByTitleContainingIgnoreCase(String title);
}
