package br.com.bookstore.catalog.service;

import br.com.bookstore.catalog.config.RabbitMQConfig;
import br.com.bookstore.catalog.dto.BookCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

// publicador de eventos de dominio do catalogo no rabbitmq
@Component
public class CatalogEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(CatalogEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public CatalogEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishBookCreated(Long bookId, Integer stock) {
        if (bookId == null) {
            return;
        }
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    sendBookCreated(bookId, stock);
                }
            });
            return;
        }
        sendBookCreated(bookId, stock);
    }

    private void sendBookCreated(Long bookId, Integer stock) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.BOOKSTORE_EVENTS_EXCHANGE,
                    RabbitMQConfig.BOOK_CREATED_ROUTING_KEY,
                    new BookCreatedEvent(bookId, stock)
            );
        } catch (AmqpException ex) {
            // evita interromper o cadastro do livro caso o broker esteja indisponivel localmente
            log.warn("Falha ao publicar evento book.created para o livro {}: {}", bookId, ex.getMessage());
        }
    }
}
