package br.com.bookstore.sales.mapper;

import br.com.bookstore.sales.dto.SaleResponse;
import br.com.bookstore.sales.model.Sale;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import java.util.List;

// mapeador de conversao entre entidade sale e dto de resposta
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface SaleMapper {

    // converte entidade sale para dto de resposta
    SaleResponse toResponse(Sale sale);

    // converte lista de entidades sale para lista de dtos de resposta
    List<SaleResponse> toResponseList(List<Sale> sales);
}
