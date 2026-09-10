package net.tape.service;

import net.tape.api.SecurityDtoV1;
import net.tape.model.Security;
import net.tape.orm.SecurityEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SecurityMapper {
    Security toModel(SecurityEntity e);
    SecurityDtoV1 toDtoV1(Security m);
    void applyToEntity(Security m, @MappingTarget SecurityEntity e);
}
