package net.tape.service;

import net.tape.api.TickerDtoV1;
import net.tape.model.TickerQuote;
import net.tape.orm.TickerQuoteEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface TickerMapper {
    TickerQuote toModel(TickerQuoteEntity e);
    TickerDtoV1 toDtoV1(TickerQuote m);
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void applyToEntity(TickerQuote m, @MappingTarget TickerQuoteEntity e);
}
