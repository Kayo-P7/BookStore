package br.com.bookstore.loan.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;

import java.net.URI;
import java.time.Instant;
import java.util.stream.Collectors;

// tratador global de excecoes do servico de emprestimos no padrao rfc 7807
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return buildProblem(HttpStatus.NOT_FOUND, "Recurso nao encontrado", ex.getMessage(), request);
    }

    @ExceptionHandler({BusinessConflictException.class, IllegalStateException.class})
    public ProblemDetail handleConflict(RuntimeException ex, HttpServletRequest request) {
        return buildProblem(HttpStatus.CONFLICT, "Conflito de operacao", ex.getMessage(), request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleBadRequest(IllegalArgumentException ex, HttpServletRequest request) {
        return buildProblem(HttpStatus.BAD_REQUEST, "Requisicao invalida", ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : error.getField())
                .collect(Collectors.joining("; "));
        return buildProblem(HttpStatus.BAD_REQUEST, "Erro de validacao", message, request);
    }

    @ExceptionHandler({ExternalServiceException.class, ResourceAccessException.class})
    public ProblemDetail handleExternalService(RuntimeException ex, HttpServletRequest request) {
        return buildProblem(HttpStatus.SERVICE_UNAVAILABLE, "Servico dependente indisponivel", ex.getMessage(), request);
    }

    private ProblemDetail buildProblem(HttpStatus status, String title, String detail, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        problem.setType(URI.create("about:blank"));
        problem.setProperty("message", detail);
        problem.setProperty("timestamp", Instant.now().toString());
        problem.setProperty("path", request.getRequestURI());
        return problem;
    }
}
