package br.com.bookstore.loan.exception;

// excecao para conflitos de estado de negocio (ex: sem exemplares ou emprestimo ja devolvido)
public class BusinessConflictException extends RuntimeException {
    public BusinessConflictException(String message) {
        super(message);
    }
}
