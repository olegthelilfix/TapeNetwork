package net.tape.service;

import net.tape.api.HostDtoV1;
import net.tape.model.Host;
import net.tape.orm.HostEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface HostMapper {
    Host toModel(HostEntity e);
    HostDtoV1 toDtoV1(Host m);
    void applyToEntity(Host m, @MappingTarget HostEntity e);
}
