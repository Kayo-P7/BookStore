package br.com.bookstore.loan.exception;

// excecao lancada quando a comunicacao com microsservicos dependentes falha
public class ExternalServiceException extends RuntimeException {
    public ExternalServiceException(String message, Throwable cause) {
        super(message, cause);
    }

    public ExternalServiceException(String message) {
        super(message);
    }
}
