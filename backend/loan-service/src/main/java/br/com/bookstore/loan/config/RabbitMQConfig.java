package br.com.bookstore.loan.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// configuracao de exchange, filas e bindings do servico de emprestimos
@Configuration
public class RabbitMQConfig {

    public static final String BOOKSTORE_EVENTS_EXCHANGE = "bookstore.events";
    public static final String BOOK_CREATED_QUEUE = "book.created.queue";
    public static final String BOOK_CREATED_ROUTING_KEY = "book.created";
    public static final String LOAN_CREATED_QUEUE = "loan.created.queue";
    public static final String LOAN_CREATED_ROUTING_KEY = "loan.created";
    public static final String LOAN_RETURNED_QUEUE = "loan.returned.queue";
    public static final String LOAN_RETURNED_ROUTING_KEY = "loan.returned";

    @Bean
    public TopicExchange bookstoreEventsExchange() {
        return new TopicExchange(BOOKSTORE_EVENTS_EXCHANGE, true, false);
    }

    @Bean
    public Queue bookCreatedQueue() {
        return new Queue(BOOK_CREATED_QUEUE, true);
    }

    @Bean
    public Queue loanCreatedQueue() {
        return new Queue(LOAN_CREATED_QUEUE, true);
    }

    @Bean
    public Queue loanReturnedQueue() {
        return new Queue(LOAN_RETURNED_QUEUE, true);
    }

    @Bean
    public Binding bookCreatedBinding(Queue bookCreatedQueue, TopicExchange bookstoreEventsExchange) {
        return BindingBuilder.bind(bookCreatedQueue)
                .to(bookstoreEventsExchange)
                .with(BOOK_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding loanCreatedBinding(Queue loanCreatedQueue, TopicExchange bookstoreEventsExchange) {
        return BindingBuilder.bind(loanCreatedQueue)
                .to(bookstoreEventsExchange)
                .with(LOAN_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding loanReturnedBinding(Queue loanReturnedQueue, TopicExchange bookstoreEventsExchange) {
        return BindingBuilder.bind(loanReturnedQueue)
                .to(bookstoreEventsExchange)
                .with(LOAN_RETURNED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }
}
