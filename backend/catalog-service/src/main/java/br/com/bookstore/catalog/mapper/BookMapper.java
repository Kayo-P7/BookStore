package br.com.bookstore.catalog.mapper;

import br.com.bookstore.catalog.dto.BookRequest;
import br.com.bookstore.catalog.dto.BookResponse;
import br.com.bookstore.catalog.model.Book;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface BookMapper {

    @Mapping(target = "id", ignore = true)
    Book toEntity(BookRequest request);

    BookResponse toResponse(Book book);

    List<BookResponse> toResponseList(List<Book> books);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromRequest(BookRequest request, @MappingTarget Book book);
}
