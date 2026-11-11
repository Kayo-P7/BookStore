package br.com.bookstore.loan.messaging;

import br.com.bookstore.loan.config.RabbitMQConfig;
import br.com.bookstore.loan.dto.BookCreatedEvent;
import br.com.bookstore.loan.model.BookLoanInventory;
import br.com.bookstore.loan.repository.BookLoanInventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

// consumidor rabbitmq responsavel por inicializar o inventario de emprestimos ao criar livros
@Component
public class BookCreatedListener {

    private static final Logger log = LoggerFactory.getLogger(BookCreatedListener.class);

    private final BookLoanInventoryRepository inventoryRepository;

    public BookCreatedListener(BookLoanInventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @RabbitListener(queues = RabbitMQConfig.BOOK_CREATED_QUEUE)
    @Transactional
    public void handleBookCreated(BookCreatedEvent event) {
        if (event == null || event.bookId() == null) {
            return;
        }
        if (inventoryRepository.existsByBookId(event.bookId())) {
            log.debug("Inventario de emprestimos ja existente para o livro {}", event.bookId());
            return;
        }
        inventoryRepository.save(BookLoanInventory.initialize(event.bookId(), event.stock()));
        log.info("Inventario de emprestimos inicializado via evento para o livro {} (copias={})",
                event.bookId(), event.stock());
    }
}
