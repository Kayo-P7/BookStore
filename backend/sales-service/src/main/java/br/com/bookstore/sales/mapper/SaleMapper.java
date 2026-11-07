package br.com.bookstore.sales.mapper;

import br.com.bookstore.sales.dto.SaleResponse;
import br.com.bookstore.sales.model.Sale;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface SaleMapper {

    SaleResponse toResponse(Sale sale);

    List<SaleResponse> toResponseList(List<Sale> sales);
}
