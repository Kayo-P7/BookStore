package br.com.bookstore.catalog.repository;

import br.com.bookstore.catalog.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;

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
}
