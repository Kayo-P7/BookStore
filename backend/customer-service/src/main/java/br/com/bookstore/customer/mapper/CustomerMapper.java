package br.com.bookstore.customer.mapper;

import br.com.bookstore.customer.dto.CustomerRequest;
import br.com.bookstore.customer.dto.CustomerResponse;
import br.com.bookstore.customer.model.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

import java.util.List;

// mapeador de conversao entre entidade customer e dtos de requisicao e resposta
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CustomerMapper {

    // converte dto de requisicao para a entidade customer
    @Mapping(target = "id", ignore = true)
    Customer toEntity(CustomerRequest request);

    // converte entidade customer para dto de resposta
    CustomerResponse toResponse(Customer customer);

    // converte lista de entidades customer para lista de dtos de resposta
    List<CustomerResponse> toResponseList(List<Customer> customers);

    // atualiza os campos da entidade customer a partir do dto de requisicao
    @Mapping(target = "id", ignore = true)
    void updateEntityFromRequest(CustomerRequest request, @MappingTarget Customer customer);
}
