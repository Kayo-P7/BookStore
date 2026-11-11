package br.com.bookstore.loan.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration

public class RabbitMQConfig {

    public static final String BOOK_CREATED_QUEUE = "book.created.queue";

    @Bean
    public Queue bookCreatedQueue() {
        return new Queue(BOOK_CREATED_QUEUE, true);
    }
}