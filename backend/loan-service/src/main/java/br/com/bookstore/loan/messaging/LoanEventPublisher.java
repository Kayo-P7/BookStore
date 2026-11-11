package br.com.bookstore.loan.messaging;

import br.com.bookstore.loan.config.RabbitMQConfig;
import br.com.bookstore.loan.dto.LoanCreatedEvent;
import br.com.bookstore.loan.dto.LoanReturnedEvent;
import br.com.bookstore.loan.model.Loan;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

// publicador de eventos de dominio de emprestimo e devolucao no rabbitmq
@Component
public class LoanEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(LoanEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public LoanEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishLoanCreated(Loan loan) {
        publish(
                RabbitMQConfig.LOAN_CREATED_ROUTING_KEY,
                new LoanCreatedEvent(loan.getId(), loan.getBookId(), loan.getCustomerId(), loan.getLoanDate(), loan.getDueDate())
        );
    }

    public void publishLoanReturned(Loan loan) {
        publish(
                RabbitMQConfig.LOAN_RETURNED_ROUTING_KEY,
                new LoanReturnedEvent(loan.getId(), loan.getBookId(), loan.getCustomerId(), loan.getReturnDate())
        );
    }

    private void publish(String routingKey, Object payload) {
        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.BOOKSTORE_EVENTS_EXCHANGE, routingKey, payload);
        } catch (AmqpException ex) {
            // evita abortar a operacao transacional se o broker estiver offline localmente
            log.warn("Falha ao publicar evento {}: {}", routingKey, ex.getMessage());
        }
    }
}
