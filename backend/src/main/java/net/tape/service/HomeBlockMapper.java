package net.tape.service;

import net.tape.model.HomeBlock;
import net.tape.orm.HomeBlockEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface HomeBlockMapper {
    HomeBlock toModel(HomeBlockEntity e);
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void applyToEntity(HomeBlock m, @MappingTarget HomeBlockEntity e);
}
