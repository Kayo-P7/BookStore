package br.com.bookstore.sales;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// ponto de entrada da aplicacao do microsservico de vendas
@SpringBootApplication
public class SalesApplication {
    public static void main(String[] args) {
        SpringApplication.run(SalesApplication.class, args);
    }
}
