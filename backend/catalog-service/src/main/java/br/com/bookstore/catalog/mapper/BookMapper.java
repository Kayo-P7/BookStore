package br.com.bookstore.catalog.mapper;

import br.com.bookstore.catalog.dto.BookRequest;
import br.com.bookstore.catalog.dto.BookResponse;
import br.com.bookstore.catalog.model.Book;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

import java.util.List;

// mapeador de conversao entre entidade book e dtos de requisicao e resposta
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface BookMapper {

    // converte dto de requisicao para a entidade book
    @Mapping(target = "id", ignore = true)
    Book toEntity(BookRequest request);

    // converte entidade book para dto de resposta
    BookResponse toResponse(Book book);

    // converte lista de entidades book para lista de dtos de resposta
    List<BookResponse> toResponseList(List<Book> books);

    // atualiza os campos da entidade book a partir do dto de requisicao
    @Mapping(target = "id", ignore = true)
    void updateEntityFromRequest(BookRequest request, @MappingTarget Book book);
}
