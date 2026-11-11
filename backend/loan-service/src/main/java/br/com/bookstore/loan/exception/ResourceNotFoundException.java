package br.com.bookstore.loan.exception;

// excecao para recursos nao encontrados no servico de emprestimos ou nos servicos integrados
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
